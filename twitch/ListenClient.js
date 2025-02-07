import { ChatClient } from "@twurple/chat";

import { authProvider, api } from "./auth.js";
import { fetcher, fetchEmotes } from "./emotes.js";
import util from "../util.js";

import emotes from "@mkody/twitch-emoticons";
const { Emote } = emotes;

import ReactionLog from "../schemas/ReactionLog.js";

export class ListenClient {

    /**
     * The chat client for this listen client.
     * @type {ChatClient}
     */
    client;

    /**
     * The channel this ListenClient is connected to.
     * @type {string}
     */
    channel;

    /**
     * The Channel ID the ListenClient is listening to. Not populated until the first message is sent.
     * @type {string}
     */
    channelId;

    /**
     * The next Websocket ID
     * @type {number}
     */
    nextWsID = 1;

    /**
     * Websockets currently connected to this ListenClient
     * @type {{
     * id: number,
     * ws: WebSocket,
     * }[]}
     */
    websockets = [];

    /**
     * Details about the current active reaction
     * @type {{emote: Emote, startTime: number, endTime: number, count: number}|null}
     */
    activeReaction = null;

    /**
     * Logs emotes for the ListenClient
     * @type {{chatterId: string, emoteId: string, time: number}[]}
     */
    emoteLog = [];

    /**
     * Current settings for the ListenClient
     * @type {{emoteWindow: number, userEmoteLimit: number, emoteThreshold: number, reactionSustainTime: number}}
     */
    settings = {
        emoteThreshold: 3,
        emoteWindow: 10,
        userEmoteLimit: 2,
        reactionSustainTime: 10,
    };

    /**
     * Timestamp in which the ListenClient was last active
     * @type {number|null}
     */
    inactiveSince = Date.now();

    /**
     * Boolean indicating if the emotes have been fetched for this channel.
     * @type {boolean}
     */
    emotesFetched = false;

    /**
     * Returns the current intent of the ChatClient
     * @returns {string}
     */
    getIntent() {
        return `chat:${this.channel}`;
    }

    /**
     * Sends a message to the channel
     * @param message
     */
    sendChatMessage(message) {
        api.asIntent([this.getIntent()], ctx => {
            ctx.chat.sendChatMessage(this.channelId, message);
        });
    }

    /**
     * Logs an emote and triggers any announcements regarding it
     * @param emote {Emote}
     * @param count {number}
     */
    announceEmote(emote, count) {
        this.websockets.forEach(ws => {
            ws.ws.send(JSON.stringify({
                type: "live-reaction",
                emoteImageUrl: emote.toLink(2),
                count,
            }));
        });

        if (count % 100 === 0) {
            let repeatedString = "";

            if (emote?.code) {
                repeatedString = `${emote.code} `.repeat(2);
            }

            this.sendChatMessage(`${repeatedString} Live Reaction Milestone Reached: ${count} ${repeatedString}`.trim());
        }
    }

    async stopReaction() {
        console.log(`[ListenClient:${this.getIntent()}] Stopping live reaction`);

        let reaction = this.activeReaction;

        if (reaction == null) return;

        this.activeReaction = null;
        this.emoteLog = [];

        const highestReaction = await ReactionLog
            .find({channelId: this.channelId})
            .sort({ count: -1 })
            .limit(1);

        if (highestReaction.length > 0 && highestReaction[0].count < reaction.count) {
            console.log(`[ListenClient:${this.getIntent()}] New record of ${reaction.count}!`);
            this.sendChatMessage(`New live reaction record! ` +
                `${util.comma(highestReaction[0].count)} on ${highestReaction[0]?.endTime?.toLocaleDateString()} -> ` +
                `${util.comma(reaction.count)} on ${new Date().toLocaleDateString()}`);
        }

        await ReactionLog.create({
            channelId: this.channelId,
            emoteId: reaction.emote.id,
            count: reaction.count,
            startTime: reaction.startTime,
            endTime: reaction.endTime,
        });
    }

    /**
     * Returns a count based on the emoteId
     * @param emoteId {string}
     * @returns {number}
     */
    calculateCount(emoteId) {
        const emoteLogs = this.emoteLog.filter(x => x.emoteId === emoteId);

        let userLogs = [];
        let logs = [];
        emoteLogs.forEach(log => {
            userLogs.push(log.chatterId);
            if (userLogs.filter(x => x === log.chatterId).length <= this.settings.userEmoteLimit) {
                logs.push(log);
            }
        });

        return logs.length;
    }

    /**
     * Logs an emote and triggers any announcements regarding it
     * @param emote {Emote}
     * @param chatterId {string}
     */
    async logEmote(emote, chatterId) {
        if (this.activeReaction) {
            if (this.activeReaction.endTime > Date.now()) {
                if (this.activeReaction.emote.id === emote.id) {
                    this.announceEmote(emote, ++this.activeReaction.count);
                    this.activeReaction.endTime = Date.now() + (this.settings.reactionSustainTime * 1000);
                }
                return;
            } else {
                await this.stopReaction();
            }
        }

        this.emoteLog.push({
            emoteId: emote.id,
            chatterId,
            time: Date.now(),
        });

        const count = this.calculateCount(emote.id);
        if (count >= this.settings.emoteThreshold) {
            this.activeReaction = {
                emote, count,
                startTime: Date.now(),
                endTime: Date.now() + (this.settings.reactionSustainTime * 1000),
            };
            console.log(`[ListenClient:${this.getIntent()}] Started new ${emote.code} reaction`);
            this.announceEmote(emote, count);
        }
    }

    /**
     * Handle a user message
     * @param channel {string}
     * @param user {string}
     * @param text {string}
     * @param msg {ChatMessage}
     */
    handleMessage(channel, user, text, msg) {
        const words = text
            .split(" ")
            .filter(x => x.length > 0);
        const recognized = [];
        for (let i = 0; i < words.length; i++) {
            const word = words[i];

            if (recognized.includes(word.toLowerCase())) continue;
            recognized.push(word.toLowerCase());

            let emote = null;
            if (fetcher.emotes.has(word)) {
                emote = fetcher.emotes.get(word);
            } else {
                let removeColon = word.replace(/:(\w+):/g, "$1");

                if (removeColon && fetcher.emotes.has(removeColon)) {
                    emote = fetcher.emotes.get(removeColon);
                }
            }

            if (emote) {
                this.logEmote(emote, user);
            }
        }
    }

    /**
     * Constructor for a ListenClient.
     * @param channel {string}
     */
    constructor(channel) {
        this.channel = channel;

        this.client = new ChatClient({
            authProvider,
            authIntents: [this.getIntent()],
            channels: [channel],
        });

        this.client.onMessage(async (chnl, user, text, msg) => {
            if (!this.channelId) {
                this.channelId = msg.channelId;
            }

            if (!this.emotesFetched) {
                await this.fetchEmotes(msg.channelId);
                this.emotesFetched = true;
            }

            this.handleMessage(chnl, user, text, msg);
        });

        setInterval(() => {
            this.emoteLog = this.emoteLog
                .filter(x => x.time >= Date.now() - (this.settings.emoteWindow * 1000));
            if (this.activeReaction && this.activeReaction.endTime < Date.now()) {
                this.stopReaction().catch(console.error);
            }
        }, 100);
    }

    /**
     * Fetches the emotes of the user
     * @param channelId
     * @returns {Promise<void>}
     */
    fetchEmotes(channelId) {
        return fetchEmotes(channelId);
    }

    connect() {
        console.log(`[ListenClient] Connecting with ListenClient ${this.channel}...`);
        return new Promise((resolve, reject) => {
            const disconnectListener = this.client.onTokenFetchFailure((error) => {
                this.client.quit();
                console.error(`[ListenClient:${this.getIntent()}] Connection failed!`);
                reject(error);
            });
            this.client.onAuthenticationSuccess(() => {
                disconnectListener.unbind();
                console.log(`[ListenClient:${this.getIntent()}] Connection successful!`);
                resolve();
            });
            this.client.connect();
        });
    }

    close() {
        console.log(`[ListenClient:${this.getIntent()}] Closing ListenClient!`);
        this.client.quit();
        this.websockets.forEach(ws => {
            ws.close(1);
        });
    }

    addWebsocket(ws) {
        let obj = {
            id: this.nextWsID++,
            ws,
        };

        this.inactiveSince = null;

        console.log(`[ListenClient:${this.getIntent()}] Connected Websocket ID ${obj.id}`);

        this.websockets.push(obj);

        ws.on("message", msg => {
            try {
                msg = JSON.parse(Buffer.from(msg).toString("utf8"));
                if (msg.type === "settings") {
                    const settings = msg?.settings;
                    if (settings &&
                        typeof settings?.emoteThreshold === "number" &&
                        typeof settings?.emoteWindow === "number" &&
                        typeof settings?.userEmoteLimit === "number" &&
                        typeof settings?.reactionSustainTime === "number") {
                        ws.send(JSON.stringify({type: "settings", ok: true, oldSettings: this.settings, newSettings: settings}));
                        this.settings = settings;
                        console.log(`[ListenClient:${this.getIntent()}] Update settings: \nUser emote limit: ${this.settings.userEmoteLimit} Emote window: ${this.settings.emoteWindow} Emote threshold: ${this.settings.emoteThreshold} Reaction sustain time: ${this.settings.reactionSustainTime}`);
                    } else {
                        ws.send(JSON.stringify({type: "settings", ok: false, error: "Invalid settings object"}));
                    }
                }
            } catch(err) {
                console.error(err);
            }
        });

        ws.onerror = console.error;

        ws.onclose = () => {
            console.log(`[ListenClient:${this.getIntent()}] Disconnecting Websocket ID ${obj.id}`);
            this.websockets = this.websockets.filter(x => x.id !== obj.id);
            if (this.websockets.length === 0) {
                console.log(`[ListenClient:${this.getIntent()}] ListenClient inactive`);
                this.inactiveSince = Date.now();
            }
        }
    }

}
