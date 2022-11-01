import axios from "axios";
import queryString from "query-string";
import rateLimit from "axios-rate-limit";
import fs from "fs";

const http = rateLimit(axios.create(), { maxRPS: 1 });

export async function checkSteamDataExists() {
  return Promise.all([
    checkFileExists("/data/games.txt"),
    checkFileExists("/data/categories.txt"),
    checkFileExists("/data/genres.txt"),
  ]).then((values) => {
    return values.every(Boolean);
  });
}

async function checkFileExists(file) {
  return fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

export async function saveSteamData() {
  const allGamesFull = [];
  const categories = [];
  const genres = [];

  // Get all games from steam
  const allGames = await http
    .get("http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json")
    .then((response) => {
      return response.data.applist.apps;
    });

  // For each game...
  for (const game of allGames) {
    const id = game.appid;

    // Grab relevant app data
    const url = "https://store.steampowered.com/api/appdetails?";
    const query = queryString.stringify({
      appids: id,
    });
    const appDetailsResponse = await http.get(url + query).catch((error) => {
      if (error.response) {
        // Request made but the server responded with an error
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // Request made but no response is received from the server.
        console.log(error.request);
      } else {
        // Error occured while setting up the request
        console.log("Error", error.message);
      }
    });

    // If failure, then skip this app
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

    allGamesFull.push(gameFull);
  }

  // Stringify JSON
  const allGamesFullStringify = JSON.stringify(allGamesFull);
  const categoriesStringify = JSON.stringify(categories);
  const genresStringify = JSON.stringify(genres);

  fs.writeFile("/data/games.txt", allGamesFullStringify, (e) => {
    if (e) {
      console.log(e);
    }
  });

  fs.writeFile("/data/categories.txt", categoriesStringify, (e) => {
    if (e) {
      console.log(e);
    }
  });

  fs.writeFile("/data/genres.txt", genresStringify, (e) => {
    if (e) {
      console.log(e);
    }
  });
}
