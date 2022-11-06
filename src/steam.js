import axios from "axios";
import queryString from "query-string";
import rateLimit from "axios-rate-limit";
import fs from "fs";

import { checkFileExists, readFile } from "./helper.js";

const http = rateLimit(axios.create(), {
  maxRequests: 2,
  perMilliseconds: 3000,
});

var allGames = [];
var len = 0;

var count = 0;
var allGamesFull = [];
var categories = [];
var genres = [];

export async function loadAllGames() {
  if (await checkFileExists("./data/allGames.txt")) {
    allGames = await readFile("./data/allGames.txt")
      .then((it) => {
        return JSON.parse(it);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    const preCheck = await http
      .get(
        "http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json"
      )
      .then((response) => {
        return response.data.applist.apps;
      });

    allGames = removeDuplicateGame(preCheck);

    fs.writeFile("./data/allGames.txt", JSON.stringify(allGames), (e) => {
      if (e) {
        console.log(e);
      }
    });
  }

  len = allGames.length;
}

function removeDuplicateGame(games) {
  var check = new Set();
  return games.filter((obj) => !check.has(obj.appid) && check.add(obj.appid));
}

export async function loadSteamData() {
  if (await checkFileExists("./data/data.txt")) {
    const dataJSON = await readFile("./data/data.txt").then((it) => {
      return JSON.parse(it);
    });

    count = dataJSON.count;
    allGamesFull = dataJSON.allGamesFull;
    categories = dataJSON.categories;
    genres = dataJSON.genres;
  }
}

export async function getSteamData() {
  for (; count < len; count++) {
    const id = allGames[count].appid;

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

function areArraysEqual(a, b) {
  return JSON.stringify(a) == JSON.stringify(b);
}

export function saveSteamData() {
  var data = {};

  data.count = count;
  data.allGamesFull = allGamesFull;
  data.categories = categories;
  data.genres = genres;

  fs.writeFile("./data/data.txt", JSON.stringify(data), (e) => {
    if (e) {
      console.log(e);
    }
  });
}
