export const removeObjectArrayDuplicates = (array, key = 'id') => {
  let uniqueIds = new Set();
  if (array?.length > 0) {
    let uniqueArray = array.filter((obj) => {
      if (!uniqueIds.has(obj[key])) {
        uniqueIds.add(obj[key]);

        if (obj[key] !== '') return true;
      }
      return false;
    });
    return uniqueArray;
  } else return [];
};
