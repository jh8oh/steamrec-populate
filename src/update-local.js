/************************************************/
/************************************************/

import { loadFromFile } from "./helper";

var allGamesId = [];
var allGamesFullId = [];
var rejectedGamesId = [];

function updateAllGamesId() {
  allGamesId = removeDuplicate(
    response.data.applist.apps.map((app) => app.appid)
  );

  fs.writeFile("./data/allGamesId.txt", JSON.stringify(allGamesId), (e) => {
    if (e) {
      console.log(e);
    }
  });
}

function getIdDifferences() {
  loadFromFile("./data/allGamesFull.txt", true).then((it) => {
    allGamesFullId = it.map((app) => app.id);
  });
}
