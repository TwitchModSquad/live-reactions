import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
    const login = req?.query?.login;
    res.render("pages/index", {login, uri: process.env.URI});
});

import auth from "./auth/index.js";
router.use("/auth", auth);

import overlay from "./overlay.js";
router.use("/overlay", overlay);

export default router;
