import { getSteamAppIds, getSteamAppInfo } from "./api.js";
import { addToRejectedAppIds, readRejectedAppIds } from "./local.js";
import { getSavedAppIds, saveApp } from "./mongodb.js";

// Public functions

export async function getMissingIds() {
  return Promise.all([
    getSteamAppIds(),
    getSavedAppIds(),
    readRejectedAppIds(),
  ]).then(([steamAppIds, savedAppIds, rejectedAppIds]) => {
    const filteredAppIds = steamAppIds.filter(
      (id) => !savedAppIds.includes(id) && !rejectedAppIds.includes(id)
    );
    console.log(`${filteredAppIds.length} apps to insert`);
    return filteredAppIds;
  });
}

export async function saveAppInfoIfValid(id, countString) {
  getSteamAppInfo(id)
    .then((app) => {
      console.log(countString + "accepted");
      saveApp(app);
    })
    .catch((id) => {
      console.log(countString + "rejected");
      addToRejectedAppIds(id);
    });
}
