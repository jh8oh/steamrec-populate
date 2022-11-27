import axios from "axios";
import queryString from "query-string";
import rateLimit from "axios-rate-limit";
import fs from "fs";

import { loadFromFile, removeDuplicate, areArraysEqual } from "./helper.js";

const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1500,
});

var allGamesFull = [];
var categories = [];
var genres = [];
var rejectedGamesId = [];

/************************************************/

await updateAllGamesId();
const missingIds = await getIdDifferences();

addMissingGames(missingIds)
  .catch((e) => {
    console.log(e);
  })
  .finally(() => {
    saveSteamData();
  });

/************************************************/

async function updateAllGamesId() {
  http
    .get("http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json")
    .then((response) => {
      let allGamesId = removeDuplicate(
        response.data.applist.apps.map((app) => app.appid)
      );

      fs.writeFile("./data/allGamesId.txt", JSON.stringify(allGamesId), (e) => {
        if (e) {
          console.log(e);
        }
      });
    });
}

async function getIdDifferences() {
  const [allGamesId, allGamesFullId, rejectedGamesId] = await Promise.all([
    loadFromFile("./data/allGamesId.txt", true).catch((err) => {
      console.log(err);
      return [];
    }),
    loadFromFile("./data/allGamesFull.txt", true)
      .then((array) => {
        return array.map((it) => it._id);
      })
      .catch((err) => {
        console.log(err);
        return [];
      }),
    loadFromFile("./data/rejectedGamesId.txt", true).catch((err) => {
      console.log(err);
      return [];
    }),
  ]);

  return allGamesId.filter(
    (id) => !allGamesFullId.includes(id) && !rejectedGamesId.includes(id)
  );
}

async function addMissingGames(missingIds) {
  [allGamesFull, categories, genres, rejectedGamesId] = await Promise.all([
    loadFromFile("./data/allGamesFull.txt", true).catch((err) => {
      return [];
    }),
    await loadFromFile("./data/categories.txt", true).catch((err) => {
      return [];
    }),

    await loadFromFile("./data/genres.txt", true).catch((err) => {
      return [];
    }),
    loadFromFile("./data/rejectedGamesId.txt", true).catch((err) => {
      return [];
    }),
  ]);

  const len = missingIds.length;
  for (let i = 0; i < len; i++) {
    const id = missingIds[i];

    const url = "https://store.steampowered.com/api/appdetails?";
    const query = queryString.stringify({
      appids: id,
    });
    const appDetailsResponse = await http.get(url + query).catch((error) => {
      throw error;
    });

    // If failure, then skip this app
    if (
      appDetailsResponse == null ||
      appDetailsResponse.data[id] == null ||
      !appDetailsResponse.data[id].success
    ) {
      rejectedGamesId.push(id);
      console.log(`${i}/${len} - ${id} - rejected`);
      continue;
    }

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
        gameCategory._id = gameCategory.id;
        delete gameCategory.id;

        categories.push(gameCategory);
      }
    });

    nonNullGenres.forEach((gameGenre) => {
      if (!genres.find((g) => g.id == gameGenre.id)) {
        gameGenre._id = gameGenre.id;
        delete gameGenre.id;

        genres.push(gameGenre);
      }
    });

    // Put successful game into gameFull
    const gameFull = {};
    gameFull._id = id;
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

    console.log(`${i}/${len} - ${id} - accepted`);
  }
}

async function saveSteamData() {
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
