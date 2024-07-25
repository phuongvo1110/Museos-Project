import mongoose from "mongoose";
import Comment from "../mongodb/models/comment.js";
import User from "../mongodb/models/user.js";
import Song from "../mongodb/models/song.js";

const createComment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { user, song, content } = req.body;
        const newComment = await Comment.create([{ user, song, content }], {
            session,
        });

        const updatedUser = await User.findByIdAndUpdate(
            user,
            { $push: { postedComments: newComment[0]._id } },
            { session, new: true }
        );
        const updatedSong = await Song.findByIdAndUpdate(
            song,
            { $push: { commentSect: newComment[0]._id } },
            { session, new: true }
        );

        if (!updatedUser || !updatedSong || updatedSong.isBanned)
            throw new Error("Invalid user or song!");

        await session.commitTransaction();
        await session.endSession();
        res.status(200).json(newComment);
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        res.status(500).json({ message: error.message });
    }
};

const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            { content },
            { new: true }
        );
        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id);
        if (!comment) throw new Error("Invalid comment!");

        await Comment.findByIdAndDelete(comment._id);
        res.status(200).json({
            message: "Comment successfully removed!",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createComment, updateComment, removeComment };
