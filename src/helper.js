import fs from "fs";

export async function loadFromFile(path, isJson) {
  if (!(await checkFileExists(path))) {
    return Promise.reject(new Error(`${path} does not exist`));
  }

  return readFile(path).then((it) => {
    if (isJson) {
      return JSON.parse(it);
    } else {
      return it;
    }
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

export function removeDuplicate(array) {
  var check = new Set();
  return array.filter((it) => !check.has(it) && check.add(it));
}

export function areArraysEqual(a, b) {
  return JSON.stringify(a) == JSON.stringify(b);
}
