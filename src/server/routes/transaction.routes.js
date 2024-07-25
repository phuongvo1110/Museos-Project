import express from "express";

import {
    createTransaction,
    rollbackTransaction,
} from "../controllers/transaction.controllers.js";

const router = express.Router();

router.route("/").post(createTransaction);
router.route("/:id").delete(rollbackTransaction);

export default router;
