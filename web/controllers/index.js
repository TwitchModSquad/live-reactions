import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
    res.render("pages/index");
});

router.get("/generator", (req, res) => {
    const login = req?.query?.login;
    res.render("pages/generator", {login, uri: process.env.URI});
});

import auth from "./auth/index.js";
router.use("/auth", auth);

import overlay from "./overlay.js";
router.use("/overlay", overlay);

export default router;
