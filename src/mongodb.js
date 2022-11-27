import { MongoClient } from "mongodb";
import { config as dotenvConfig } from "dotenv";

import { loadFromFile } from "./helper.js";

dotenvConfig();

/************************************************/
try {
  insertGames();
  insertCategories();
  insertGenres();
} catch (err) {
  console.log(err);
}
/************************************************/

async function insertGames() {
  const allGamesFull = await loadFromFile(
    "./data/allGamesFull.txt",
    true
  ).catch((err) => {
    throw err;
  });

  filterExisting("games", allGamesFull)
    .then((filteredAllGamesFull) => {
      if (filteredAllGamesFull.length > 0) {
        insert("games", filteredAllGamesFull);
      }
    })
    .catch((err) => {
      throw err;
    });
}

async function insertCategories() {
  const categories = await loadFromFile("./data/categories.txt", true).catch(
    (err) => {
      throw err;
    }
  );

  filterExisting("categories", categories)
    .then((filteredCategories) => {
      if (filteredCategories.length > 0) {
        insert("categories", filteredCategories);
      }
    })
    .catch((err) => {
      throw err;
    });
}

async function insertGenres() {
  const genres = await loadFromFile("./data/genres.txt", true).catch((err) => {
    throw err;
  });

  filterExisting("genres", genres)
    .then((filteredGenres) => {
      if (filteredGenres.length > 0) {
        insert("genres", filteredGenres);
      }
    })
    .catch((err) => {
      throw err;
    });
}

async function filterExisting(collectionName, objArray) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(process.env.MONGODB_URI)
      .then((client) => {
        client
          .db("steamrec")
          .collection(collectionName)
          .find({}, { _id: 1 })
          .toArray()
          .then((array) =>
            resolve(
              objArray.filter(
                (obj) => !array.map((it) => it._id).includes(obj._id)
              )
            )
          )
          .catch((err) => reject(err))
          .finally(() => {
            client.close();
          });
      })
      .catch((err) => reject(err));
  });
}

function insert(collectionName, objArray) {
  MongoClient.connect(process.env.MONGODB_URI)
    .then((client) => {
      client
        .db("steamrec")
        .collection(collectionName)
        .insertMany(objArray)
        .finally(() => {
          client.close();
        });
    })
    .catch((err) => {
      throw err;
    });
}
