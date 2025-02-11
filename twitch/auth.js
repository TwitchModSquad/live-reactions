import {RefreshingAuthProvider} from "@twurple/auth";

import TwitchToken from "../schemas/TwitchToken.js";
import {ApiClient} from "@twurple/api";
import ClientManager from "./ClientManager.js";

export const authProvider = new RefreshingAuthProvider({
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_SECRET_ID,
    redirectUri: process.env.URI + "auth/twitch",
});

export const api = new ApiClient({
    authProvider,
});

authProvider.onRefresh(async (userId, tokenData) => {
    console.log("[TwitchAuth] Refreshing token for " + userId);
    await TwitchToken.findOneAndUpdate(
        {
            user: userId
        }, {
            $set: { tokenData, }
        }, {
            upsert: true,
            new: true,
        });
});

await TwitchToken
    .find({})
    .populate(["user"])
    .then(tokens => {
    console.log(`[TwitchAuth] Loading ${tokens.length} tokens`);

    tokens.forEach(token => {
        authProvider.addUser(token.user._id, token.tokenData, ["chat:" + token.user.login]);
    });
}, err => {
    console.error("[TwitchAuth] Failed to get tokens:");
    console.error(err);
});
