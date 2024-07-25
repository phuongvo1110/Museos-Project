import express from "express";

import {
    updateTrend,
    getAllTrends,
    getTrendArtists,
    getTrendSongs,
} from "../controllers/trend.controllers.js";

const router = express.Router();

router.use(updateTrend);
router.route("/").get(getAllTrends);
router.route("/artists").get(getTrendArtists);
router.route("/songs").get(getTrendSongs);

export default router;
