import express from "express";
import {fetcher} from "../../twitch/emotes.js";
const router = express.Router();

router.get("/", (req, res) => {
    res.redirect("/");
});

router.get("/:channel", (req, res) => {
    let channel = req.params.channel;
    let example = false;
    let title = "Live Reaction";
    let font = "archivo-black";
    let settings = {
        emoteThreshold: 3,
        emoteWindow: 10,
        userEmoteLimit: 2,
        reactionSustainTime: 10,
    };

    if (!channel || channel.length < 2 || channel.length > 25) {
        res.send("Invalid channel name")
        return;
    }

    if (req.query.hasOwnProperty("example")) {
        example = true;
    }

    if (req.query.hasOwnProperty("title")) {
        title = req.query.title;
    }

    if (req.query.hasOwnProperty("font")) {
        font = req.query.font;
    }

    if (req.query.hasOwnProperty("emote_threshold")) {
        settings.emoteThreshold = Number(req.query.emote_threshold);
        if (isNaN(settings.emoteThreshold) || settings.emoteThreshold < 1) {
            res.send("Invalid emote threshold value. Must be a number greater than 0");
            return;
        }
    }
    if (req.query.hasOwnProperty("emote_window")) {
        settings.emoteWindow = Number(req.query.emote_window);
        if (isNaN(settings.emoteWindow) || settings.emoteWindow < 1) {
            res.send("Invalid emote window value. Must be a number greater than 0");
            return;
        }
    }
    if (req.query.hasOwnProperty("user_emote_limit")) {
        settings.userEmoteLimit = Number(req.query.user_emote_limit);
        if (isNaN(settings.emoteWindow) || settings.emote_window < 1) {
            res.send("Invalid emote window value. Must be a number greater than 0");
            return;
        }
    }
    if (req.query.hasOwnProperty("reaction_sustain_time")) {
        settings.reactionSustainTime = Number(req.query.reaction_sustain_time);
        if (isNaN(settings.reactionSustainTime) || settings.reactionSustainTime < 1) {
            res.send("Invalid reaction sustain time value. Must be a number greater than 0");
            return;
        }
    }

    const emoteUrls = fetcher.emotes.map(x => x.toLink(2));

    res.render("pages/overlay", {
        wsUri: process.env.WS_URI,
        emoteUrls,
        channel,
        example,
        title,
        font,
        settings,
    });
});

export default router;
