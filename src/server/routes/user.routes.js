import express from "express";

import {
    createUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
} from "../controllers/user.controllers.js";

const router = express.Router();

router.route("/").post(createUser);
router.route("/login").post(loginUser);
router.route("/").get(getAllUsers);
router.route("/:id").get(getUserById);
router.route("/:id").patch(updateUser);

export default router;
