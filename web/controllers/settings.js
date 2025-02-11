import express from "express";
const router = express.Router();

import util from "../../util.js";
import ReactionLog from "../../schemas/ReactionLog.js";
const settings = util.settings;

const REACTION_LOG_CACHE_TIME = 10 * 60 * 60 * 1000; // 10 minutes

/**
 *
 * @type {{userId: string, reactionLogs: any, cachedAt: number}[]}
 */
let reactionLogCache = [];

/**
 * Returns the reaction log for a user
 * @param userId {string}
 * @returns {Promise<any>}
 */
const getReactionLog = async (userId) => {
    const logCache = reactionLogCache.find(x => x.userId === userId);
    if (logCache) {
        return logCache.reactionLogs;
    }

    const reactionLogs = await ReactionLog
        .find({channelId: userId})
        .sort({count: -1})
        .populate(["channelId"]);

    reactionLogCache.push({
        userId, reactionLogs,
        cachedAt: Date.now(),
    });
    return reactionLogs;
}

router.get("/", async (req, res) => {
    const user = req.user;
    const token = req.token;
    if (!user || !token) {
        res.redirect("/");
        return;
    }
    res.render("pages/settings", {
        user, token, settings,
        uri: process.env.URI,
        reactionLogs: await getReactionLog(user.id),
        util,
    });
});

setInterval(() => {
    reactionLogCache = reactionLogCache.filter(x => x.cachedAt + REACTION_LOG_CACHE_TIME >= Date.now());
}, 5000);

export default router;
