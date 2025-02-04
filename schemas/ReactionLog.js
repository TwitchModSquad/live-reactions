import mongoose from "mongoose";

const schema = new mongoose.Schema({
    channelId: {
        type: String,
        required: true,
        index: true,
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

export default mongoose.model("ReactionLog", schema);
