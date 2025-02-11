import emotes from "@mkody/twitch-emoticons";
import { api } from "./auth.js";

export const fetcher = new emotes.EmoteFetcher(
    null, null, {
        apiClient: api,
    }
);

/**
 * Fetches all emotes for a channel (or global emotes)
 * @param channelId
 * @returns {Promise<void>}
 */
export const fetchEmotes = async (channelId = null) => {
    try {
        console.log(`Fetching BTTV emotes${channelId ? ` for ${channelId}` : ""}`);
        await fetcher.fetchBTTVEmotes(channelId);
    } catch(err) {
        console.error("Failed to fetch global BTTV emotes.");
    }

    try {
        console.log(`Fetching FFZ emotes${channelId ? ` for ${channelId}` : ""}`);
        await fetcher.fetchFFZEmotes(channelId);
    } catch(err) {
        console.error("Failed to fetch global FFZ emotes.");
    }

    try {
        console.log(`Fetching 7TV emotes${channelId ? ` for ${channelId}` : ""}`);
        await fetcher.fetchSevenTVEmotes(channelId);
    } catch(err) {
        console.error("Failed to fetch 7TV emotes.");
    }

    try {
        console.log(`Fetching Twitch emotes${channelId ? ` for ${channelId}` : ""}`);
        await fetcher.fetchTwitchEmotes(channelId);
    } catch(err) {
        console.error("Failed to fetch Twitch emotes.");
    }
}

// Fetch all global emotes
fetchEmotes().catch(console.error);
