import {
  loadAllGames,
  loadSteamData,
  getSteamData,
  saveSteamData,
} from "./src/steam.js";

// Load all data
await loadAllGames();
await loadSteamData();

getSteamData()
  .catch((e) => {
    console.log(e);
  })
  .finally(() =>{
    saveSteamData();
  });
