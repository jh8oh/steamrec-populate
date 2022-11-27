export function removeDuplicate(array) {
  var check = new Set();
  return array.filter((it) => !check.has(it) && check.add(it));
}

export function areArraysEqual(a, b) {
  return JSON.stringify(a) == JSON.stringify(b);
}
