import express from "express";
const router = express.Router();

import util from "../../../util.js";
import TwitchUser from "../../../schemas/TwitchUser.js";

import clientManager from "../../../twitch/ClientManager.js";

router.post("/", async (req, res) => {
    try {
        util.validateSettings(req.body);

        const user = await TwitchUser.findByIdAndUpdate(req.user.id, {
            $set: { settings: req.body },
        }, {
            new: true,
        });

        req.clearCache();
        clientManager.updateSettings(user.id, user.settings);

        res.send({ok: true, settings: user.settings});
    } catch(error) {
        if (typeof error === "string") {
            res.json({ok: false, error});
        } else {
            console.error(error);
            res.json({ok: false, error: "An unknown error occurred!"});
        }
    }
});

export default router;
