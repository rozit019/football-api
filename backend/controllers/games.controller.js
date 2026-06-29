import express from "express";
import { Game } from "../models/game.model.js";

export const getGames = async (req, res) => {
  try {
    const { date, sport, league } = req.query;

    let query = {};

    // Filter by date (frontend sends UTC date string like "2026-06-29")
    if (date) {
      const startOfDay = new Date(date + "T00:00:00Z");
      const endOfDay = new Date(date + "T23:59:59.999Z");
      query.utcDateTime = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Default: show upcoming games from now (UTC)
      query.utcDateTime = { $gte: new Date() };
    }

    if (sport) query.sport = sport;
    if (league) query.league = league;

    const games = await Game.find(query).sort({ utcDateTime: 1 }).limit(50);

    res.json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTodayGames = async (req, res) => {
  try {
    // Get today's date in UTC
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // "2026-06-29"

    const startOfToday = new Date(todayStr + "T00:00:00Z");
    const endOfToday = new Date(todayStr + "T23:59:59.999Z");

    const games = await Game.find({
      utcDateTime: { $gte: startOfToday, $lte: endOfToday },
    }).sort({ utcDateTime: 1 });

    res.json({ success: true, data: games });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLiveGames = async (req, res) => {
  try {
    const games = await Game.find({ status: "live" }).sort({
      utcDateTime: -1,
    });
    res.json({ success: true, data: games });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
