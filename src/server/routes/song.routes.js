import express from "express";

import {
    createSong,
    updateSong,
    removeSong,
    listenSong,
    likeSong,
    unlikeSong,
    getAllSongs,
    getSongById,
} from "../controllers/song.controllers.js";

const router = express.Router();

router.route("/").post(createSong);
router.route("/").get(getAllSongs);
router.route("/:id").get(getSongById);
router.route("/:id").patch(updateSong);
router.route("/:id").delete(removeSong);
router.route("/listen").post(listenSong);
router.route("/like").post(likeSong);
router.route("/unlike").post(unlikeSong);

export default router;
