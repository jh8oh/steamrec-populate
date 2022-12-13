import fs from "fs";

// Variables

var rejectedAppIds = null;

// Public functions

export async function readRejectedAppIds() {
  if (!rejectedAppIds) {
    await readFile("./data/rejectedAppIds.txt")
      .then((it) => {
        rejectedAppIds = JSON.parse(it);

        process.on("SIGINT", () => {
          writeRejectedAppIds();
          process.exit(0);
        });
      })
      .catch((err) => {
        console.log(err);
        rejectedAppIds = [];
      });
  }
  return rejectedAppIds;
}

export function addToRejectedAppIds(id) {
  rejectedAppIds.push(id);
}

// Private functions

function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

function writeRejectedAppIds() {
  fs.writeFile(
    "./data/rejectedAppIds.txt",
    JSON.stringify(rejectedAppIds),
    (e) => {
      if (e) {
        console.log(e);
      }
    }
  );
}
