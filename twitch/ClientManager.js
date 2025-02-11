import {ListenClient} from "./ListenClient.js";
import Token from "../schemas/Token.js";
import TwitchUser from "../schemas/TwitchUser.js";

const CLIENT_TIMEOUT = 5 * 60 * 1000;

class ClientManager {

    /**
     * Clients that are currently active
     * @type {ListenClient[]}
     */
    activeClients = [];

    async createClients() {
        const users = await TwitchUser.find({});
        users.forEach(user => {
            const listenClient = new ListenClient(user, user.settings);
            this.activeClients.push(listenClient);
            listenClient.connect().catch(console.error);
        });
    }

    /**
     * Update ListenClient settings for a user
     * @param userId {string}
     * @param settings {any}
     */
    updateSettings(userId, settings) {
        const listenClients = this.activeClients.filter(x => x.user.id === userId);
        listenClients.forEach(client => {
            client.updateSettings(settings);
        });
    }

    constructor() {
        this.createClients().catch(console.error);

        setInterval(() => {
            this.activeClients.forEach(client => {
                client.websockets.forEach(ws => {
                    ws.ws.ping();
                });
            });
        }, 30000);
    }

    /**
     * Binds a WebSocket to an active ListenClient
     * @param ws {WebSocket}
     * @param tokenId {string}
     * @returns {Promise<void>}
     */
    async bindWebsocket(ws, tokenId) {
        const token = await Token
            .findById(tokenId)
            .populate(["user"]);

        if (!token) {
            throw "Invalid token provided!";
        }

        let listenClient = this.activeClients.find(x => x.user.id === token.user.id);

        if (!listenClient) {
            listenClient = new ListenClient(token.user, token.user.settings);
            try {
                await listenClient.connect();
            } catch(err) {
                throw err;
            }
            this.activeClients.push(listenClient);
        }

        listenClient.addWebsocket(ws);
    }

}

export default new ClientManager();