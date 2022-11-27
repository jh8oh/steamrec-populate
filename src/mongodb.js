import { MongoClient } from "mongodb";

const connection = MongoClient.connect(process.env.MONGODB_URI);

export function insertGames(allGamesFull) {
  connection
    .then((client) => {
      client
        .db("steamrec")
        .collection("games")
        .insertMany(allGamesFull)
        .finally(() => {
          client.close();
        });
    })
    .catch((err) => {
      throw err;
    });
}

export function insertCategories(categories) {
  connection
    .then((client) => {
      client
        .db("steamrec")
        .collection("categories")
        .insertMany(categories)
        .finally(() => {
          client.close();
        });
    })
    .catch((err) => {
      throw err;
    });
}

export function insertGenres(genres) {
  connection
    .then((client) => {
      client
        .db("steamrec")
        .collection("genres")
        .insertMany(genres)
        .finally(() => {
          client.close();
        });
    })
    .catch((err) => {
      throw err;
    });
}
