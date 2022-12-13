import { MongoClient } from "mongodb";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();
MongoClient.connect(process.env.MONGODB_URI)
  .then((client) => {
    client
      .db("steamrec")
      .collection("games")
      .createIndex(
        {
          developers: "text",
          publishers: "text",
          categories: "text",
          genres: "text",
          tags: "text",
        },
        {
          name: "RecommendIndex",
          weights: {
            developers: 3,
            publishers: 3,
            categories: 1,
            genres: 2,
            tags: 4,
          },
        }
      );
  })
  .catch((err) => {
    throw err;
  });
