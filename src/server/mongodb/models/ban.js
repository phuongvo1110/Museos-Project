import mongoose from "mongoose";

const BanSchema = new mongoose.Schema(
    {
        users: [{ type: mongoose.model("User").schema, default: [] }],
    },
    { timestamps: true }
);

const banModel = mongoose.model("Ban", BanSchema);

export default banModel;
