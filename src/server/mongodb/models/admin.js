import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        isAdmin: { type: Boolean, required: true, default: true },
        avatarPath: {
            type: String,
            required: true,
            default:
                "https://museos-seslay.s3.ap-southeast-1.amazonaws.com/default_avatar.jpg",
        },
    },
    { timestamps: true }
);

const adminModel = mongoose.model("Admin", AdminSchema);

export default adminModel;
