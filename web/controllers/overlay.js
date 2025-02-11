import express from "express";
import {fetcher} from "../../twitch/emotes.js";
import util from "../../util.js";

const router = express.Router();

router.get("/", (req, res) => {
    if (!req.user || !req.token) {
        return res.status(401).send("Unauthorized. Check your token parameter, or generate a new URL on the website!");
    }

    let title = req.user.settings.title;
    let font = req.user.settings.font;
    let example = false;

    if (req.query.hasOwnProperty("title")) {
        title = req.query.title;
    }
    if (req.query.hasOwnProperty("font")) {
        font = req.query.font;
    }
    if (req.query.hasOwnProperty("example")) {
        example = true;
    }

    const emoteUrls = fetcher.emotes.map(x => x.toLink(2));

    res.render("pages/overlay", {
        wsUri: process.env.WS_URI,
        emoteUrls,
        example,
        title,
        font,
        token: req.token,
        startTime: util.startTime,
    });
});

export default router;
