import mongoose from "mongoose";
import Ban from "./ban.js";
import User from "./user.js";
// Should be a `import Song from "./song.js"` but that would cause
// a dependency cycle

const CommentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
        content: { type: String, required: true },
        isBanned: { type: Boolean, required: true, default: false },
    },
    { timestamps: true }
);

const removeRefComment = async (cmt) => {
    if (cmt.isBanned)
        await Ban.updateOne(
            { "users._id": cmt.user },
            { $pull: { "users.$.postedComments": cmt._id } }
        );
    else
        await User.findByIdAndUpdate(cmt.user, {
            $pull: { postedComments: cmt._id },
        });

    await mongoose.model("Song").findByIdAndUpdate(cmt.song, {
        $pull: { commentSect: cmt._id },
    });
};

CommentSchema.pre("findOneAndDelete", async function removeRefs(next) {
    try {
        const cmtID = this.getFilter();
        const cmt = await this.model.findOne({ _id: cmtID });
        await removeRefComment(cmt);
        next();
    } catch (error) {
        next(error);
    }
});

CommentSchema.pre("deleteMany", async function removeRefs(next) {
    try {
        const filter = this.getFilter();
        const comments = await this.model.find(filter);
        comments.forEach((cmt) => removeRefComment(cmt));
        next();
    } catch (error) {
        next(error);
    }
});

const commentModel = mongoose.model("Comment", CommentSchema);

export default commentModel;
