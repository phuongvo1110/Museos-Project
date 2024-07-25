import express from "express";

import {
    banUser,
    unbanUser,
    updateBan,
} from "../controllers/ban.controllers.js";

const router = express.Router();

router.use(updateBan);
router.route("/users/:id").post(banUser);
router.route("/users/:id").delete(unbanUser);

export default router;
