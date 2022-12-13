import { getSteamAppIds, getSteamAppInfo } from "./api.js";
import { addToRejectedAppIds, readRejectedAppIds } from "./local.js";
import { getSavedAppIds, saveApp } from "./mongodb.js";

// Public functions

export async function getMissingIds() {
  Promise.all([getSteamAppIds, getSavedAppIds, readRejectedAppIds]).then(
    ([steamAppIds, savedAppIds, rejectedAppIds]) =>
      steamAppIds.filter(
        (id) => !savedAppIds.includes(id) && !rejectedAppIds.includes(id)
      )
  );
}

export async function saveAppInfoIfValid(id) {
  getSteamAppInfo(id)
    .then((app) => {
      saveApp(app);
    })
    .catch((id) => {
      addToRejectedAppIds(id);
    });
}
