import express from "express";
const router = express.Router();

import ReactionLog from "../../../schemas/ReactionLog.js";

router.delete("/all", async (req, res) => {
    try {
        await ReactionLog.deleteMany({ channelId: req.user.id });
        res.json({ok: true});
    } catch(error) {
        console.error(error);
        res.json({ok: false, error: "An unexpected error occurred!"});
    }
});

export default router;
