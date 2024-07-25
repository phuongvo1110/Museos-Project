import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, required: true },
    },
    { timestamps: true }
);

const transactionModel = mongoose.model("Transaction", TransactionSchema);

export default transactionModel;
