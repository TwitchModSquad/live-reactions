import mongoose from "mongoose";

const schema = new mongoose.Schema({
    user: {
        type: String,
        ref: "TwitchUser",
    },
    tokenData: {
        accessToken: {
            type: String,
            required: true,
        },
        expiresIn: Number,
        obtainmentTimestamp: Number,
        refreshToken: String,
        scope: [String],
    },
});

export default mongoose.model("TwitchToken", schema);

