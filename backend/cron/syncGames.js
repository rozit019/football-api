import cron from "node-cron";
import { fetchFootballFixtures } from "../services/footballService.js";
// import { fetchCricketFixtures } from "../services/cricketService.js";
// import { fetchUFCFixtures } from "../services/ufcService.js";
import { fetchF1Fixtures } from "../services/f1Service.js";

// Run every 2 hours
cron.schedule("0 */2 * * *", async () => {
  console.log("🔄 Syncing all game schedules...", new Date().toISOString());

  await Promise.allSettled([
    fetchFootballFixtures(),
    // fetchCricketFixtures(),
    // fetchUFCFixtures(),
    fetchF1Fixtures(),
  ]);

  console.log("✅ Sync complete");
});

// Run on server start
(async () => {
  console.log("🚀 Initial sync on startup...");
  await Promise.allSettled([
    fetchFootballFixtures(),
    // fetchCricketFixtures(),
    // fetchUFCFixtures(),
    fetchF1Fixtures(),
  ]);
})();
