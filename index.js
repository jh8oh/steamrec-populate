import axios from "axios";
import queryString from "query-string";
import rateLimit from "axios-rate-limit";

const http = rateLimit(axios.create(), { maxRPS: 5 });

// Get all games from steam
const allGames = await http
  .get("http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json")
  .then((response) => {
    return response.data.applist.apps;
  });

const allGamesFull = [];
const categories = [];
const genres = [];

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

  // Save unregistered genres and categories into categories and gennres
  Array.from(gameData.categories).forEach((gameCategory) => {
    if (!categories.find((c) => c.id == gameCategory.id)) {
      categories.push(gameCategory);
    }
  });

  Array.from(gameData.genres).forEach((gameGenre) => {
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
  gameFull.categories = Array.from(gameData.categories).map((c) => {
    return c.id;
  });
  gameFull.genres = Array.from(gameData.genres).map((g) => {
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

