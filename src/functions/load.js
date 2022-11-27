import fs from "fs";

export async function loadFromFile(path) {
  if (!(await checkFileExists(path))) {
    return Promise.reject(new Error(`${path} does not exist`));
  }
  
  return readFile(path).then((it) => {
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
