import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import connectDB from "./mongodb/connect.js";
import userRouter from "./routes/user.routes.js";
import banRouter from "./routes/ban.routes.js";
import commentRouter from "./routes/comment.routes.js";
import songRouter from "./routes/song.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import trendRouter from "./routes/trend.routes.js";
import transactionRouter from "./routes/transaction.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send({ message: "Hello, World!" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/bans", banRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/songs", songRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/trends", trendRouter);
app.use("/api/v1/transactions", transactionRouter);

const startServer = async () => {
    try {
        connectDB(`${process.env.MONGODB_URL}`);
        app.listen(3000, () =>
            console.log("Server started on port http://localhost:3000")
        );
    } catch (error) {
        console.log(error);
    }
};

startServer();
