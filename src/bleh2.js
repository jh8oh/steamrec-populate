import fs from "fs";
import { loadFromFile } from "./helper.js";

const allGamesFull = await loadFromFile(
  "./data/allGamesFullFull.txt",
  true
).catch((err) => {
  console.log(err);
  return [];
});

for (let i in allGamesFull) {
  if (
    allGamesFull[i].categories != null &&
    allGamesFull[i].categories.every((it) => it == null)
  ) {
    allGamesFull.splice(i, 1);
    continue;
  }

  if (
    allGamesFull[i].genres != null &&
    allGamesFull[i].genres.every((it) => it == null)
  ) {
    allGamesFull.splice(i, 1);
    continue;
  }

  if (allGamesFull[i].genres != null) {
    allGamesFull[i].genres = allGamesFull[i].genres.map((g) => g.description);
  }
}

fs.writeFile(
  "./data/allGamesFullFullFull.txt",
  JSON.stringify(allGamesFull),
  (e) => {
    if (e) {
      console.log(e);
    }
  }
);
