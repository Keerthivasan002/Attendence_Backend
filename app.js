import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import user from "./routes/router.js";
import cors from "cors"
dotenv.config()
const app = express()
app.use(cors({ origin: "*" }))
app.use(express.json())
mongoose.connect(process.env.URL);
mongoose.connection.on("disconnected", () => console.log("disconnected"));
mongoose.connection.on("reconnected", () => console.log("reconnected"));
mongoose.connection.on("disconnecting", () => console.log("disconnecting"));
mongoose.connection.on("close", () => console.log("close"));
mongoose.connection.on("connected", () => {
    try {
        app.use("/", user)
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.log(`Node server error - ${error}`);
    }
});