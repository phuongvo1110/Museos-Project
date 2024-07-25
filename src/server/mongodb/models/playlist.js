import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        coverPath: {
            type: String,
            required: true,
            default:
                "https://museos-seslay.s3.ap-southeast-1.amazonaws.com/default_songCover.png",
        },
        isBanned: { type: Boolean, required: true, default: false },
        songs: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Song", default: [] },
        ],
        allowedUsers: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
        ],
    },
    { timestamps: true }
);

PlaylistSchema.pre("findOneAndDelete", async function removeRefs(next) {
    try {
        const id = this.getFilter();
        const playlist = await this.model.findById(id);

        if (playlist.isBanned)
            await mongoose
                .model("Ban")
                .updateOne(
                    { "users._id": playlist.creator },
                    { $pull: { "users.$.playlists": playlist._id } }
                );
        else
            await mongoose.model("User").findByIdAndUpdate(playlist.creator, {
                $pull: { playlists: playlist._id },
            });

        next();
    } catch (error) {
        next(error);
    }
});

const playlistModel = mongoose.model("Playlist", PlaylistSchema);

export default playlistModel;
