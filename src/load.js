import fs from "fs";

export async function loadAllGamesFromFile() {
  if (!(await checkFileExists("./data/allGames.txt"))) {
    return Promise.reject(new Error("allGames does not exist"));
  }
  
  return readFile("./data/allGames.txt").then((it) => {
    return JSON.parse(it);
  });
}

export async function loadDataFromFile() {
  if (await checkFileExists("./data/data.txt")) {
    return Promise.reject(new Error("data does not exist"));
  }

  return readFile("./data/data.txt").then((it) => {
    return JSON.parse(it);
  });
}

async function checkFileExists(file) {
  return await fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}
