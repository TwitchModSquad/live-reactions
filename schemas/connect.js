import mongoose from "mongoose";

console.log("Connecting to MongoDB...");
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB!");
}, err => {
    console.error("Could not connect to MongoDB:");
    console.error(err);
});
