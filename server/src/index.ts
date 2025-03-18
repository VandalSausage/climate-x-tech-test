import express from "express";
import { assets } from "./routes";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
};
app.use(cors(corsOptions)).use("/assets", assets);

export const server = app;
