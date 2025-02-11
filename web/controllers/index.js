import { Router } from "express";
const router = Router();

import Token from "../../schemas/Token.js";
import TwitchUser from "../../schemas/TwitchUser.js";

import auth from "./auth/index.js";
router.use("/auth", auth);

/**
 * Stores tokens
 * @type {{tokenId: string, token: any, user: any}[]}
 */
let tokenCache = [];

router.use("/", async (req, res, next) => {
    let tokenId = req.cookies.token;

    if (req?.query?.token && req.query.token.length === 32) {
        tokenId = req.query.token;
    }

    let token = null;
    let user = null;

    if (tokenId) {
        const cacheHit = tokenCache.find(x => x.tokenId === tokenId);
        if (cacheHit) {
            token = cacheHit.token;
            user = cacheHit.user;
            if (token.used_at <= Date.now() - 60 * 1000) {
                await Token.findByIdAndUpdate(tokenId, {
                    $set: {
                        used_at: Date.now(),
                    }
                });
            }
        } else {
            token = await Token.findByIdAndUpdate(tokenId, {
                $set: {
                    used_at: Date.now(),
                }
            }, {
                new: true,
            });
            if (token) {
                user = await TwitchUser.findById(token.user);
                if (user) {
                    tokenCache.push({
                        tokenId, user, token,
                    });
                }
            }
        }
    }

    req.clearCache = function() {
        if (tokenId) {
            tokenCache = tokenCache.filter(x => x.tokenId !== tokenId);
        }
    }

    req.user = user;
    req.token = token;

    next();
});

router.get("/", (req, res) => {
    res.render("pages/index", {user: req.user});
});

import overlay from "./overlay.js";
router.use("/overlay", overlay);

import settings from "./settings.js";
router.use("/settings", settings);

import api from "./api/index.js";
router.use("/api", api);

export default router;
