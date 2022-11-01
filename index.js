import { checkSteamDataExists, saveSteamData } from "./src/data.js";

const steamDataExists = await checkSteamDataExists()

if (!steamDataExists){
    await saveSteamData()
}