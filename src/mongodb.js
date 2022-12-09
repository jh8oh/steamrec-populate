import { MongoClient } from "mongodb";
import { config as dotenvConfig } from "dotenv";

import { loadFromFile } from "./helper.js";

dotenvConfig();

/************************************************/
try {
  insertGames();
  insertCategories();
  insertGenres();
  insertTags();
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
      console.log(`Inserting ${filteredAllGamesFull.length} games`);
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
      console.log(`Inserting ${filteredCategories.length} categories`);
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
      console.log(`Inserting ${filteredGenres.length} genres`);
      if (filteredGenres.length > 0) {
        insert("genres", filteredGenres);
      }
    })
    .catch((err) => {
      throw err;
    });
}

async function insertTags(){
  const tags = await loadFromFile("./data/tags.txt", true).catch((err) => {
    throw err;
  });

  filterExisting("tags", tags)
    .then((filteredTags) => {
      console.log(`Inserting ${filteredTags.length} tags`);
      if (filteredTags.length > 0) {
        insert("tags", filteredTags);
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
          .distinct("_id")
          .then((array) => {
            let intArray = array.map((it) => parseInt(it));

            return resolve(
              objArray.filter((obj) => !intArray.includes(obj._id))
            );
          })
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
