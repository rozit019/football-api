import axios from "axios";
import { Game } from "../models/game.model.js";

const ESPN_API_BASE = "https://site.api.espn.com/apis/site/v2/sports/mma/ufc";

function toNepalTime(utcString) {
  const date = new Date(utcString);
  return new Date(date.getTime() + (5 * 60 + 45) * 60 * 1000);
}

function extractFightersFromName(eventName) {
  // Pattern: "UFC 289: Oliveira vs Dariush" or "UFC Fight Night: Kara-France vs Albazi"
  const match = eventName?.match(
    /:\s*(.+?)\s+(?:vs\.?|VS\.?)\s+(.+?)(?:\s|$)/i,
  );
  if (match) return [match[1].trim(), match[2].trim()];
  return ["TBD", "TBD"];
}

export const fetchUFCFixtures = async () => {
  try {
    const response = await axios.get(`${ESPN_API_BASE}/scoreboard`);
    const events = response.data.events || [];

    if (events.length === 0) {
      console.log("⚠️ No UFC events returned from ESPN");
      return;
    }

    let syncedCount = 0;

    for (const event of events) {
      if (!event.date || !event.id) continue;

      const utcDate = new Date(event.date);
      const nepalDate = toNepalTime(event.date);

      // Try competitors first, fallback to parsing event name
      const mainFight = event.competitions?.[0];
      let fighter1, fighter2;

      if (mainFight?.competitors?.[0]?.athlete?.displayName) {
        fighter1 = mainFight.competitors[0].athlete.displayName;
        fighter2 = mainFight.competitors[1]?.athlete?.displayName || "TBD";
      } else {
        [fighter1, fighter2] = extractFightersFromName(event.name);
      }

      await Game.findOneAndUpdate(
        { externalId: event.id.toString(), source: "espn-ufc" },
        {
          sport: "ufc",
          league: event.season?.displayName || "UFC",
          homeTeam: fighter1,
          awayTeam: fighter2,
          utcDateTime: utcDate,
          nepalDateTime: nepalDate,
          status: mapUFCStatus(event.status?.type?.name),
          venue: mainFight?.venue?.fullName || event.venue?.fullName || "TBD",
          externalId: event.id.toString(),
          source: "espn-ufc",
          updatedAt: new Date(),
        },
        { upsert: true, new: true },
      );

      syncedCount++;
    }

    console.log(`✅ Synced ${syncedCount} UFC events`);
  } catch (error) {
    console.error("UFC API Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
};

function mapUFCStatus(espnStatus) {
  const statusMap = {
    STATUS_SCHEDULED: "scheduled",
    STATUS_IN_PROGRESS: "live",
    STATUS_FINAL: "finished",
    STATUS_POSTPONED: "postponed",
  };
  return statusMap[espnStatus] || "scheduled";
}

export default fetchUFCFixtures;
