import express from "express";
import ClientManager from "../twitch/ClientManager.js";

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let app = express();

import expressWs from "express-ws";
expressWs(app);

import cookieParser from "cookie-parser";
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.ws("/ws", (ws, req) => {
    ws.on("message", msg => {
        try {
            msg = JSON.parse(Buffer.from(msg).toString("utf8"));

            if (msg.type === "authorize" && typeof msg.token === "string") {
                ClientManager.bindWebsocket(ws, msg.token).then(() => {
                    ws.send(JSON.stringify({type: "authorize", ok: true}));
                }, error => {
                    console.error(error);
                    if (typeof error === "string") {
                        ws.send(JSON.stringify({type: "authorize", ok: false, error}));
                    } else {
                        ws.send(JSON.stringify({type: "authorize", ok: false, error: "Unable to connect. Ensure you've authenticated with your channel!"}))
                    }
                });
            }
        } catch(err) {
            console.error(`Failed to handle message ${msg}:`);
            console.error(err);
        }
    });
});

app.use(express.static("web/static"));

import controllers from "./controllers/index.js";
app.use("/", controllers);

const port = process.env.PORT || 3300;
app.listen(port, () => {
    console.error(`Started Express on port ${port}`);
});
