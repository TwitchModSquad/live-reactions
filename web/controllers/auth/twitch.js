import { Router } from "express";
const router = new Router();

import { authProvider, api } from "../../../twitch/auth.js";
import TwitchToken from "../../../schemas/TwitchToken.js";

const TWITCH_SCOPES = [
    "chat:read",
    "chat:edit",
    "user:write:chat",
];
export const TWITCH_URI = `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(process.env.TWITCH_CLIENT_ID)}&redirect_uri=${encodeURIComponent(process.env.URI + "auth/twitch")}&scope=${encodeURIComponent(TWITCH_SCOPES.join(" "))}`;

router.get("/", async (req, res) => {
    if (req?.query?.code) {
        authProvider.addUserForCode(req.query.code, ["chat"]).then(async user => {
            const tokenData = await authProvider.getAccessTokenForUser(user);

            const helixUser = await api.users.getUserById(user);

            if (tokenData.scope.indexOf("chat:edit") === -1) {
                res.send(`Provided scope is missing chat:edit scope. Please refresh to try again.`);
                return;
            }

            await TwitchToken.findOneAndUpdate({
                user: tokenData.userId,
            }, { $set: { userLogin: helixUser.name, tokenData }}, {
                upsert: true,
                new: true,
            });

            res.redirect(`/generator?login=${helixUser.name}`);
        }, err => {
            res.redirect(TWITCH_URI);
        });
    } else {
        res.redirect(TWITCH_URI);
    }
});

export default router;
