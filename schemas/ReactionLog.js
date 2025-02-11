import mongoose from "mongoose";

import { fetcher } from "../twitch/emotes.js";
import util from "../util.js";

const schema = new mongoose.Schema({
    channelId: {
        type: String,
        required: true,
        index: true,
        ref: "TwitchUser",
    },
    emoteId: {
        type: String,
        required: true,
        index: true,
    },
    count: {
        type: Number,
        required: true,
        index: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
});

schema.methods.getDuration = function() {
    return Math.floor((this.endTime - this.startTime) / 1000);
}

schema.methods.getStringDuration = function() {
    return util.formatDuration(this.getDuration(), 2);
}

schema.methods.getEmote = function() {
    return fetcher.emotes.find(x => x.id === this.emoteId);
}

export default mongoose.model("ReactionLog", schema);
