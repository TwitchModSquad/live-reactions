import mongoose from "mongoose";

const schema = new mongoose.Schema({
    _id: {
        type: String,
    },
    user: {
        type: String,
        ref: "TwitchUser",
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    used_at: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Token", schema);

