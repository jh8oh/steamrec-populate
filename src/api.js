import axios from "axios";
import queryString from "query-string";
import rateLimit from "axios-rate-limit";

import { containsAny, areArraysEqual } from "./helper.js";

// Variables

const steamPowered = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1500,
});
const steamSpy = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000,
});

const allSteamAppsUrl =
  "http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json";
const steamAppInfoUrl = "https://store.steampowered.com/api/appdetails?";
const steamAppTagsUrl = "https://steamspy.com/api.php?";

// Public functions

export async function getSteamAppIds() {
  return steamPowered
    .get(allSteamAppsUrl)
    .then((response) => [
      ...new Set(response.data.applist.apps.map((app) => app.appid)),
    ]);
}

export async function getSteamAppInfo(id) {
  return new Promise(async (resolve, reject) => {
    const appInfoQuery = queryString.stringify({
      appids: id,
    });
    const appTagsQuery = queryString.stringify({
      request: "appdetails",
      appid: id,
    });
    const [appInfoResponse, appTagsResponse] = await Promise.all([
      steamPowered.get(steamAppInfoUrl + appInfoQuery),
      steamSpy.get(steamAppTagsUrl + appTagsQuery),
    ]).catch(() => {
      return reject(id);
    });

    if (
      appInfoResponse == null ||
      appInfoResponse.data[id] == null ||
      !appInfoResponse.data[id].success
    ) {
      return reject(id);
    }

    const appData = appInfoResponse.data[id].data;
    const appTags = appTagsResponse.data.tags
      ? Object.keys(appTagsResponse.data.tags)
      : null;
    let appInfo = {
      _id: id,
      name: appData.name,
      type: appData.type,
      baseGameId: appData.fullGame ? appData.fullgame.appid : null,
      developers: appData.developers,
      publishers: appData.publishers,
      categories: appData.categories
        ? appData.categories.map((it) => it.description)
        : null,
      genres: appData.genres
        ? appData.genres.map((it) => it.description)
        : null,
      release_date: appData.release_date,
      recommendations: appData.recommendations
        ? appData.recommendations.total
        : null,
      metacritic: appData.metacritic ? appData.metacritic.score : null,
      adult: isAppAdult(appData.content_descriptors, appTags),
      tags: appTags,
    };

    if (isAppValid(appInfo)) {
      return resolve(appInfo);
    } else {
      return reject(id);
    }
  });
}

// Private function

function isAppAdult(contentDescriptors, tags) {
  if (tags) {
    if (containsAny(tags, ["NSFW", "Nudity", "Sexual Content"])) {
      return true;
    }
  }

  if (areArraysEqual(contentDescriptors?.ids, [1, 3, 5])) {
    return true;
  }

  return false;
}

// Sometimes, app info genres and categories return an array of null despite API calls returning a valid array. These apps are considered invalid.
function isAppValid(appInfo) {
  if (
    appInfo.categories != null &&
    appInfo.categories.every((it) => it == null)
  ) {
    return false;
  }

  if (appInfo.genres != null && appInfo.genres.every((it) => it == null)) {
    return false;
  }

  return true;
}
