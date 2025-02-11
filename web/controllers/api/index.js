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

export default router;
