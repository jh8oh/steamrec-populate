import axios from "axios";
import queryString from "query-string";
import rateLimit from "axios-rate-limit";
import fs from "fs";

import { loadFromFile } from "./helper.js";

const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000,
});

var count = 0;
var allGamesFull = [];
var tags = [];

/************************************************/

getTags()
  .catch((e) => {
    console.log(e);
  })
  .finally(() => {
    saveSteamData();
  });

/************************************************/

async function getTags() {
  [allGamesFull, tags, count] = await Promise.all([
    loadFromFile("./data/allGamesFull.txt", true).catch((err) => {
      console.log(err);
      return [];
    }),
    await loadFromFile("./data/tags.txt", true).catch((err) => {
      console.log(err);
      return [];
    }),

    await loadFromFile("./data/count.txt", false).catch((err) => {
      console.log(err);
      return [];
    }),
  ]);

  let len = allGamesFull.length;
  for (; count < len; count++) {
    const id = allGamesFull[count]._id;

    console.log(`${count}/${len} - ${id}`);

    // Grab relevant app data
    const url = "https://steamspy.com/api.php?";
    const query = queryString.stringify({
      request: "appdetails",
      appid: id,
    });
    const appDetailsResponseTags = await http
      .get(url + query)
      .then((res) => {
        return res.data.tags;
      })
      .catch((error) => {
        throw error;
      });

    let gameTags = [];
    for (let key in appDetailsResponseTags) {
      let tagDescription = key;
      console.log(tagDescription);
      let tagId = tags.find((t) => t.description == tagDescription)._id;

      gameTags.push({ tagId: tagId, voteAmount: appDetailsResponseTags[key] });
    }

    allGamesFull[count].tags = gameTags;
  }
}

async function saveSteamData() {
  fs.writeFile("./data/allGamesFull.txt", JSON.stringify(allGamesFull), (e) => {
    if (e) {
      console.log(e);
    }
  });

  fs.writeFile("./data/tags.txt", JSON.stringify(tags), (e) => {
    if (e) {
      console.log(e);
    }
  });

  fs.writeFile("./data/count.txt", count.toString(), (e) => {
    if (e) {
      console.log(e);
    }
  });
}
