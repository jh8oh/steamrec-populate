import { MongoClient } from "mongodb";

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
