import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";
import "./cron/syncGames.js";
import gamesRoutes from "./routes/games.routes.js";

dotenv.config();

const app = express();

// backend/server.js
const corsOptions = {
  origin: (origin, callback) => {
    // Allow localhost and any vercel.app domain
    const allowedOrigins = ["http://localhost:5173", "https://localhost:5173"];

    // Check if origin ends with vercel.app or is in allowed list
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith("vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/games", gamesRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server working on port ${PORT}`);
});
