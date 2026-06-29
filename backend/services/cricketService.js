import axios from "axios";
import { Game } from "../models/game.model.js";

const CRIC_API_KEY = process.env.CRIC_API_KEY;

function toNepalTime(utcString) {
  const date = new Date(utcString);
  return new Date(date.getTime() + (5 * 60 + 45) * 60 * 1000);
}

export const fetchCricketFixtures = async () => {
  try {
    const response = await axios.get(
      `https://api.cricapi.com/v1/currentMatches?apikey=${CRIC_API_KEY}&offset=0`,
    );

    const matches = response.data.data || [];

    for (const match of matches) {
      const matchDate = new Date(match.dateTimeGMT + "Z"); // GMT to UTC
      const nepalDate = toNepalTime(match.dateTimeGMT + "Z");

      await Game.findOneAndUpdate(
        { externalId: match.id, source: "cricapi" },
        {
          sport: "cricket",
          league: match.series,
          homeTeam: match.teams[0],
          awayTeam: match.teams[1],
          utcDateTime: matchDate,
          nepalDateTime: nepalDate,
          status: match.status === "Match not started" ? "scheduled" : "live",
          venue: match.venue,
          externalId: match.id,
          source: "cricapi",
          updatedAt: new Date(),
        },
        { upsert: true, returnDocument: "after" },
      );
    }

    console.log(`Synced ${matches.length} cricket fixtures`);
  } catch (error) {
    console.error("Cricket API Error:", error.message);
  }
};

export default fetchCricketFixtures;
