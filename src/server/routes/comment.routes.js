import express from "express";

import {
    createComment,
    updateComment,
    removeComment,
} from "../controllers/comment.controllers.js";

const router = express.Router();

router.route("/").post(createComment);
router.route("/:id").patch(updateComment);
router.route("/:id").delete(removeComment);

export default router;
