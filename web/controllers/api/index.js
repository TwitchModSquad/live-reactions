import express from "express";
const router = express.Router();

import bodyParser from "body-parser";
router.use(bodyParser.json());

router.use("/", (req, res, next) => {
    if (req.user && req.token) {
        next();
    } else {
        res.json({ok: false, error: "Unauthorized"});
    }
});

import settings from "./settings.js";
router.use("/settings", settings);

import reactionlogs from "./reactionlogs.js";
router.use("/reactionlogs", reactionlogs);

export default router;
