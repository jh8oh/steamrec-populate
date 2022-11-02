import fs from "fs";

export async function checkFileExists(file) {
  return await fs.promises
    .access(file)
    .then(() => true)
    .catch((e) => false);
}

export function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}
