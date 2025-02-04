import { Router } from "express";
const router = new Router();

import twitch from "./twitch.js";
router.use("/twitch", twitch);

export default router;
