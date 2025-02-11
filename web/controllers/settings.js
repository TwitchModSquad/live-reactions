import express from "express";
const router = express.Router();

import util from "../../util.js";
const settings = util.settings;

router.get("/", (req, res) => {
    const user = req.user;
    const token = req.token;
    if (!user || !token) {
        res.redirect("/");
        return;
    }
    res.render("pages/settings", {
        user, token, settings,
        uri: process.env.URI,
    });
});

export default router;
