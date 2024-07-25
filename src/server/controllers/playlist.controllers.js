import mongoose from "mongoose";
import Playlist from "../mongodb/models/playlist.js";
import { baseDownURL, getSignedURL } from "../utils/aws.utils.js";

const createPlaylist = async (req, res) => {
    try {
        const { title, creator, upCover = "", song = "", user = "" } = req.body;

        const inits = song
            ? { title, creator, songs: [song] }
            : { title, creator };

        if (user) inits.allowedUsers = [user];

        let newPlaylist = await Playlist.create(inits);
        let coverUpLink = "";

        if (upCover) {
            newPlaylist = await Playlist.findByIdAndUpdate(
                newPlaylist._id,
                {
                    coverPath: `${baseDownURL}/${newPlaylist._id}_cover.png`,
                },
                { new: true }
            );

            coverUpLink = await getSignedURL(`${newPlaylist._id}_cover.png`);
        }

        await mongoose.model("User").findByIdAndUpdate(creator, {
            $push: { playlists: newPlaylist._id },
        });

        const response = upCover ? { newPlaylist, coverUpLink } : newPlaylist;
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await Playlist.findById(id).populate([
            { path: "creator" },
            { path: "songs" },
        ]);

        if (!playlist) throw new Error("Invalid playlist!");

        res.header("song-total-count", playlist.songs.length);
        res.header("Access-Control-Expose-Headers", "song-total-count");
        res.status(200).json(playlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { title = "", newCover = "", song = "", user = "" } = req.body;

        const updates = title ? { title } : {};

        let coverUpLink = "";
        if (newCover) {
            updates.coverPath = `${baseDownURL}/${id}_cover.png`;
            coverUpLink = await getSignedURL(`${id}_cover.png`);
        }

        const $push = {};
        if (song) $push.songs = song;
        if (user) $push.allowedUsers = user;
        if (JSON.stringify($push) !== "{}") updates.$push = $push;

        const updatedPlaylist = await Playlist.findByIdAndUpdate(id, updates, {
            new: true,
        });

        const response = newCover
            ? { updatedPlaylist, coverUpLink }
            : updatedPlaylist;

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rupdatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { song = "", user = "" } = req.body;

        const updates = {};
        const $pull = {};
        if (song) $pull.songs = song;
        if (user) $pull.allowedUsers = user;
        if (JSON.stringify($pull) !== "{}") updates.$pull = $pull;

        const updatedPlaylist = await Playlist.findByIdAndUpdate(id, updates, {
            new: true,
        });

        res.status(200).json(updatedPlaylist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await Playlist.findById(id);
        if (!playlist) throw new Error("Invalid playlist!");

        await Playlist.findByIdAndDelete(playlist._id);
        res.status(200).json({
            message: `${playlist.title} successfully removed!`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    rupdatePlaylist,
    removePlaylist,
};
