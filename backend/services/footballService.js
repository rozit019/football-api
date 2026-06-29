import axios from "axios";
import { Game } from "../models/game.model.js";

// Generate date ranges for next 30 days
function getDateRanges() {
  const ranges = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const formatted = date.toISOString().split("T")[0].replace(/-/g, "");
    ranges.push(formatted);
  }

  return ranges;
}

export const fetchFootballFixtures = async () => {
  try {
    const deleted = await Game.deleteMany({ sport: "football" });
    console.log(`Deleted ${deleted.deletedCount} old football games`);

    const leagues = [
      "fifa.world",
      "eng.1",
      "esp.1",
      "ger.1",
      "ita.1",
      "fra.1",
      "uefa.champions",
    ];

    let allEvents = [];

    for (const league of leagues) {
      try {
        if (league === "fifa.world") {
          const dates = getDateRanges();
          for (let i = 0; i < dates.length; i += 7) {
            const batch = dates.slice(i, i + 7);
            const dateRange = `${batch[0]}-${batch[batch.length - 1]}`;

            const response = await axios.get(
              `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`,
              {
                params: { dates: dateRange },
                timeout: 10000,
              },
            );

            const events = response.data.events || [];
            allEvents = allEvents.concat(events);
          }
        } else {
          const response = await axios.get(
            `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`,
            { timeout: 10000 },
          );

          const events = response.data.events || [];
          allEvents = allEvents.concat(events);
        }
      } catch (err) {
        console.log(`${league} failed:`, err.message);
      }
    }

    console.log(`Total ESPN events: ${allEvents.length}`);

    if (allEvents.length === 0) {
      console.log("WARNING: No football events from ESPN!");
      return;
    }

    for (const event of allEvents) {
      const competition = event.competitions?.[0];
      if (!competition) continue;

      const home = competition.competitors?.find((c) => c.homeAway === "home");
      const away = competition.competitors?.find((c) => c.homeAway === "away");

      // Store PURE UTC - no conversion!
      const utcDate = new Date(event.date);

      await Game.findOneAndUpdate(
        { externalId: event.id },
        {
          sport: "football",
          league: event.league?.name || "Unknown",
          homeTeam: home?.team?.displayName || "TBD",
          awayTeam: away?.team?.displayName || "TBD",
          utcDateTime: utcDate,
          status: mapStatus(event.status?.type?.name),
          homeScore: home?.score ? parseInt(home.score) : null,
          awayScore: away?.score ? parseInt(away.score) : null,
          venue: competition.venue?.fullName || "TBD",
          externalId: event.id,
          source: "espn",
          updatedAt: new Date(),
        },
        { upsert: true, returnDocument: "after" },
      );
    }

    console.log(`Synced ${allEvents.length} football fixtures`);
  } catch (error) {
    console.error("ESPN Error:", error.message);
  }
};

function mapStatus(status) {
  const map = {
    STATUS_SCHEDULED: "scheduled",
    STATUS_IN_PROGRESS: "live",
    STATUS_HALFTIME: "live",
    STATUS_FINAL: "finished",
    STATUS_POSTPONED: "postponed",
    STATUS_SUSPENDED: "postponed",
  };
  return map[status] || "scheduled";
}
