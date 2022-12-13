import axios from "axios";
import queryString from "query-string";
import rateLimit from "axios-rate-limit";
import fs from "fs";

import { MongoClient } from "mongodb";
import { loadFromFile } from "./helper.js";

var [allGamesFull, fileTags, fileGenres, fileCategories] = await Promise.all([
  loadFromFile("./data/allGamesFull.txt", true).catch((err) => {
    console.log(err);
    return [];
  }),
  await loadFromFile("./data/tags.txt", true).catch((err) => {
    console.log(err);
    return [];
  }),
  await loadFromFile("./data/genres.txt", true).catch((err) => {
    console.log(err);
    return [];
  }),
  await loadFromFile("./data/categories.txt", true).catch((err) => {
    console.log(err);
    return [];
  }),
]);

const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1500,
});

try {
  for (let i in allGamesFull) {
    let gameFull = allGamesFull[i];
    let id = gameFull._id;
    console.log(`${i}/${allGamesFull.length}: ${id} - ${gameFull.name}`);

    allGamesFull[i].tags = gameFull.tags?.map((tag) => {
      let tagInfo = fileTags.find((it) => it._id == tag.tagId);
      return {
        description: tagInfo.description,
        type: tagInfo.type,
        voteAmount: tag.voteAmount,
      };
    });

    if (
      gameFull.genres.every((it) => it == null) ||
      gameFull.categories.every((it) => it == null)
    ) {
      const appDetailsResponse = await http
        .get(`https://store.steampowered.com/api/appdetails?appids=${id}`)
        .catch((error) => {
          throw error;
        });

      if (
        appDetailsResponse == null ||
        appDetailsResponse.data[id] == null ||
        !appDetailsResponse.data[id].success
      ) {
        allGamesFull.splice(i, 1);
        continue;
      }
      let gameData = appDetailsResponse.data[id].data;

      if (gameData.genres != null) {
        allGamesFull[i].genres = gameData.genres.map((it) => it.description);
      } else {
        allGamesFull[i].genres = null;
      }

      if (gameData.categories != null) {
        allGamesFull[i].categories = gameData.categories.map((it) => it.description);
      } else {
        allGamesFull[i].categories = null;
      }
    } else {
        allGamesFull[i].genres = gameFull.genres?.map((genre) => {
        let genreInfo = fileGenres.find((it) => it._id == genre);
        return { description: genreInfo.description, type: genreInfo.type };
      });

      allGamesFull[i].categories = gameFull.categories?.map((category) => {
        let categoryInfo = fileCategories.find((it) => it._id == category);
        return categoryInfo.description;
      });
    }
  }
} finally {
  fs.writeFile("./data/allGamesFullFull.txt", JSON.stringify(allGamesFull), (e) => {
    if (e) {
      console.log(e);
    }
  });
}
