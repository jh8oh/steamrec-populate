export function areArraysEqual(a, b) {
  return JSON.stringify(a) == JSON.stringify(b);
}

export function containsAny(source, target) {
  var result = source.filter(function (item) {
    return target.indexOf(item) > -1;
  });
  return result.length > 0;
}
