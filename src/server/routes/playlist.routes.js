import express from "express";

import {
    createPlaylist,
    getPlaylistById,
    removePlaylist,
    rupdatePlaylist,
    updatePlaylist,
} from "../controllers/playlist.controllers.js";

const router = express.Router();

router.route("/").post(createPlaylist);
router.route("/:id").get(getPlaylistById);
router.route("/:id").patch(updatePlaylist);
router.route("/r/:id").patch(rupdatePlaylist);
router.route("/:id").delete(removePlaylist);

export default router;
