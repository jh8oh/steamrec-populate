import { MongoClient } from "mongodb";
import { config as dotenvConfig } from "dotenv";

// Init

dotenvConfig();

// Variables

var client = null;

// Public functions

export async function getSavedAppIds() {
  return getDatabase().then((db) => db.collection("apps").distinct("_id"));
}

export async function saveApp(app) {
  getDatabase().then((db) => db.collection("apps").insertOne(app));
}

// Private functions

function disconnectMongoClient() {
  if (client) {
    client.close();
    client = null;
  }
}

async function getDatabase() {
  if (!client) {
    await MongoClient.connect(process.env.MONGODB_URI)
      .then((c) => {
        client = c;

        process.on("SIGINT", () => {
          disconnectMongoClient();
          process.exit(0);
        });
      })
      .catch((err) => {
        console.log("Could not connect to the database", err);
        process.exit(1);
      });
  }

  return client.db("steamrec");
}
