import mongoose from "mongoose";

import util from "../util.js";

const settings = {};

util.settings.forEach(setting => {
    let type = null;
    switch (setting.type) {
        case "number":
            type = Number;
            break;
        default:
            type = String;
    }

    settings[setting.id] = {
        type,
        default: setting.default,
    }

    if (setting?.optgroup) {
        settings[setting.id].enum = util.getPossibleSelectValues(setting);
    }
});

const schema = new mongoose.Schema({
    _id: {
        type: String,
    },
    login: {
        type: String,
        minLength: 1,
        maxLength: 25,
        required: true,
        index: true,
    },
    display_name: {
        type: String,
        minLength: 1,
        maxLength: 25,
        required: true,
    },
    type: {
        type: String,
        enum: ["", "admin", "global_mod", "staff"],
        default: "",
    },
    broadcaster_type: {
        type: String,
        enum: ["", "affiliate", "partner"],
        default: "",
    },
    follower_count: Number,
    description: String,
    profile_image_url: String,
    offline_image_url: String,
    settings,
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("TwitchUser", schema);
