export const compareArraysOfObjects = (arr1, arr2) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (!genericObjectCompare(arr1[i], arr2[i])) {
      return false;
    }
  }

  return true;
};

export const genericObjectCompare = (obj1, obj2) => {
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1).filter((key) => obj1[key] !== undefined);
  const keys2 = Object.keys(obj2).filter((key) => obj2[key] !== undefined);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (key === 'children') {
      if (!compareArraysOfObjects(obj1[key] ?? [], obj2[key] ?? [])) return false;
    } else if (!keys2.includes(key) || !genericObjectCompare(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};
