import axios from "axios";
import { Game } from "../models/game.model.js";

const F1_API_BASE = "https://api.jolpi.ca/ergast/f1";

export const fetchF1Fixtures = async () => {
  try {
    const currentYear = new Date().getFullYear();

    const response = await axios.get(`${F1_API_BASE}/${currentYear}.json`);
    const races = response.data.MRData.RaceTable.Races || [];

    for (const race of races) {
      const sessions = [
        {
          name: "Practice 1",
          time: race.FirstPractice?.date + "T" + race.FirstPractice?.time,
        },
        {
          name: "Practice 2",
          time: race.SecondPractice?.date + "T" + race.SecondPractice?.time,
        },
        {
          name: "Practice 3",
          time: race.ThirdPractice?.date + "T" + race.ThirdPractice?.time,
        },
        {
          name: "Qualifying",
          time: race.Qualifying?.date + "T" + race.Qualifying?.time,
        },
        { name: "Sprint", time: race.Sprint?.date + "T" + race.Sprint?.time },
        { name: "Race", time: race.date + "T" + race.time },
      ].filter((s) => s.time && !s.time.includes("undefined"));

      for (const session of sessions) {
        // Store PURE UTC - no conversion!
        const utcDate = new Date(session.time);
        if (isNaN(utcDate)) continue;

        const sessionId = `${race.round}-${session.name.replace(/\s/g, "")}`;

        await Game.findOneAndUpdate(
          { externalId: sessionId, source: "ergast-f1" },
          {
            sport: "f1",
            league: `F1 ${currentYear}`,
            homeTeam: session.name,
            awayTeam: race.raceName,
            utcDateTime: utcDate, // PURE UTC
            status: utcDate > new Date() ? "scheduled" : "finished",
            venue:
              race.Circuit?.circuitName +
              ", " +
              race.Circuit?.Location?.country,
            externalId: sessionId,
            source: "ergast-f1",
            updatedAt: new Date(),
          },
          { upsert: true, returnDocument: "after" },
        );
      }
    }

    console.log(`Synced ${races.length} F1 race weekends`);
  } catch (error) {
    console.error("F1 API Error:", error.message);
  }
};

export default fetchF1Fixtures;
