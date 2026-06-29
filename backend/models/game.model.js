import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  sport: { type: String, required: true },
  league: { type: String, required: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  utcDateTime: { type: Date, required: true }, // Store pure UTC from API
  status: {
    type: String,
    enum: ["scheduled", "live", "finished", "postponed"],
    default: "scheduled",
  },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  venue: { type: String },
  externalId: { type: String },
  source: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

gameSchema.index({ utcDateTime: 1, sport: 1 });

export const Game = mongoose.model("Game", gameSchema);
