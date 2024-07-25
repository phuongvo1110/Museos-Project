import mongoose from "mongoose";

const trendArtistSchema = new mongoose.Schema({
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    listenCnt: {
        type: Number,
        required: true,
        default: 0,
    },
});

const trendSongSchema = new mongoose.Schema({
    song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
    },
    listenCnt: {
        type: Number,
        required: true,
        default: 0,
    },
});

const trendSchema = new mongoose.Schema({
    month: { type: Number, required: true },
    artists: [{ type: trendArtistSchema, default: [] }],
    songs: [{ type: trendSongSchema, default: [] }],
});

const trendModel = mongoose.model("Trend", trendSchema);

export default trendModel;
