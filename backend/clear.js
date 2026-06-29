import mongoose from "mongoose";
import { Game } from "./models/game.model.js";

await mongoose.connect(
  "mongodb://rojitaryal70_db_user:FgDS9tuLTHPnDLbm@ac-bmv7dv5-shard-00-00.ufyo2pn.mongodb.net:27017,ac-bmv7dv5-shard-00-01.ufyo2pn.mongodb.net:27017,ac-bmv7dv5-shard-00-02.ufyo2pn.mongodb.net:27017/?ssl=true&replicaSet=atlas-cs8hle-shard-0&authSource=admin&appName=Cluster0",
);

const result = await Game.deleteMany({});
console.log(`Deleted ${result.deletedCount} games`);

await mongoose.disconnect();
