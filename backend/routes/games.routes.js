import express from "express";
import {
  getGames,
  getTodayGames,
  getLiveGames,
} from "../controllers/games.controller.js";
const router = express.Router();

// GET /api/games?date=2026-06-27&sport=football
router.get("/", getGames);

// GET /api/games/today
router.get("/today", getTodayGames);

// GET /api/games/live
router.get("/live", getLiveGames);

export default router;
