import axios from "axios";
import queryString from "query-string";
import rateLimit from "axios-rate-limit";
import fs from "fs";

import { loadFromFile } from "./functions/load.js";
import { removeDuplicate, areArraysEqual } from "./functions/helper.js";

const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1500,
});

var allGamesId = [];
var len = 0;

var count = 0;
var allGamesFull = [];
var categories = [];
var genres = [];

// Load all data
await fetchAllGames();
await loadLocalData();

fetchSteamData()
  .catch((e) => {
    console.log(e);
  })
  .finally(() => {
    saveSteamData();
  });

async function fetchAllGames() {
  loadFromFile("./data/allGamesId.txt", true)
    .then((it) => {
      allGamesId = it;
    })
    .catch((err) => {
      console.log(err);
      http
        .get(
          "http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json"
        )
        .then((response) => {
          allGamesId = removeDuplicate(
            response.data.applist.apps.map((app) => app.appid)
          );

          fs.writeFile(
            "./data/allGamesId.txt",
            JSON.stringify(allGamesId),
            (e) => {
              if (e) {
                console.log(e);
              }
            }
          );
        });
    })
    .finally(() => {
      len = allGamesId.length;
    });
}

async function loadLocalData() {
  await loadFromFile("./data/allGamesFull.txt", true)
    .then((it) => {
      allGamesFull = it;
    })
    .catch((err) => {
      console.log(err);
    });

  await loadFromFile("./data/categories.txt", true)
    .then((it) => {
      categories = it;
    })
    .catch((err) => {
      console.log(err);
    });

  await loadFromFile("./data/genres.txt", true)
    .then((it) => {
      genres = it;
    })
    .catch((err) => {
      console.log(err);
    });

  await loadFromFile("./data/count.txt", false)
    .then((it) => {
      count = parseInt(it);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function fetchSteamData() {
  for (; count < len; count++) {
    const id = allGamesId[count];

    console.log(`${count}/${len} - ${id}`);

    // Grab relevant app data
    const url = "https://store.steampowered.com/api/appdetails?";
    const query = queryString.stringify({
      appids: id,
    });
    const appDetailsResponse = await http.get(url + query).catch((error) => {
      throw error;
    });

    // If failure, then skip this app
    if (appDetailsResponse == null) continue;
    if (appDetailsResponse.data[id] == null) continue;
    if (!appDetailsResponse.data[id].success) continue;

    const gameData = appDetailsResponse.data[id].data;

    // Save unregistered genres and categories into categories and genres
    var nonNullCategories;
    var nonNullGenres;

    if (gameData.categories != null) {
      nonNullCategories = Array.from(gameData.categories);
    } else {
      nonNullCategories = [];
    }

    if (gameData.genres != null) {
      nonNullGenres = Array.from(gameData.genres);
    } else {
      nonNullGenres = [];
    }

    nonNullCategories.forEach((gameCategory) => {
      if (!categories.find((c) => c.id == gameCategory.id)) {
        categories.push(gameCategory);
      }
    });

    nonNullGenres.forEach((gameGenre) => {
      if (!genres.find((g) => g.id == gameGenre.id)) {
        genres.push(gameGenre);
      }
    });

    // Put successful game into gameFull
    const gameFull = {};
    gameFull.id = id;
    gameFull.name = gameData.name;
    gameFull.type = gameData.type;
    if (gameData.fullgame != null) {
      gameFull.baseGameId = gameData.fullgame.appid;
    } else {
      gameFull.baseGameId = null;
    }
    gameFull.developers = gameData.developers;
    gameFull.publishers = gameData.publishers;
    gameFull.categories = nonNullCategories.map((c) => {
      return c.id;
    });
    gameFull.genres = nonNullGenres.map((g) => {
      return g.id;
    });
    gameFull.release_date = gameData.release_date;
    if (gameData.recommendations != null) {
      gameFull.recommendations = gameData.recommendations.total;
    } else {
      gameFull.recommendations = null;
    }
    if (gameData.metacritic != null) {
      gameFull.metacritic = gameData.metacritic.score;
    } else {
      gameFull.metacritic = null;
    }
    if (gameData.content_descriptors.ids != null) {
      if (areArraysEqual(gameData.content_descriptors.ids, [1, 3, 5])) {
        gameFull.adult = true;
      } else {
        gameFull.adult = false;
      }
    }

    allGamesFull.push(gameFull);
  }
}

async function saveSteamData() {
  var data = {};

  data.allGamesFull = allGamesFull;
  data.categories = categories;
  data.genres = genres;

  fs.writeFile("./data/allGamesFull.txt", JSON.stringify(allGamesFull), (e) => {
    if (e) {
      console.log(e);
    }
  });

  fs.writeFile("./data/categories.txt", JSON.stringify(categories), (e) => {
    if (e) {
      console.log(e);
    }
  });

  fs.writeFile("./data/genres.txt", JSON.stringify(genres), (e) => {
    if (e) {
      console.log(e);
    }
  });
}