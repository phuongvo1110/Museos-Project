import mongoose from "mongoose";
import Ban from "./ban.js";
import User from "./user.js";
import Trend from "./trend.js";
import Playlist from "./playlist.js";
import Comment from "./comment.js";

const SongSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        artist: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        length: { type: Number, required: true, default: 0 },
        lyricsPath: { type: String, required: true, default: " " },
        listenCnt: { type: Number, required: true, default: 0 },
        heartCnt: { type: Number, required: true, default: 0 },
        coverPath: {
            type: String,
            required: true,
            default:
                "https://museos-seslay.s3.ap-southeast-1.amazonaws.com/default_songCover.png",
        },
        filePath: { type: String, required: true, default: " " },
        isBanned: { type: Boolean, required: true, default: false },
        commentSect: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
                default: [],
            },
        ],
    },
    { timestamps: true }
);

SongSchema.pre("findOneAndDelete", async function removeRefs(next) {
    try {
        const songID = this.getFilter();
        const thisSong = await this.model.findOne({ _id: songID });
        if (thisSong.isBanned)
            await Ban.updateOne(
                { "users._id": thisSong.artist },
                { $pull: { "users.$.uploadedSongs": thisSong._id } }
            );
        else
            await User.findByIdAndUpdate(thisSong.artist, {
                $pull: { uploadedSongs: thisSong._id },
            });

        await Trend.updateOne({}, { $pull: { songs: { song: thisSong._id } } });
        await Playlist.updateMany(
            {},
            { $pull: { songs: thisSong._id } },
            { multi: true }
        );
        await Comment.deleteMany({ _id: { $in: thisSong.commentSect } });
        next();
    } catch (error) {
        next(error);
    }
});

const songModel = mongoose.model("Song", SongSchema);

export default songModel;
