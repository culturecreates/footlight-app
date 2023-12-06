export const removeObjectArrayDuplicates = (array, key = 'id') => {
  let uniqueIds = new Set();
  let uniqueArray = array.filter((obj) => {
    if (!uniqueIds.has(obj[key])) {
      uniqueIds.add(obj[key]);
      return true;
    }
    return false;
  });
  return uniqueArray;
};
