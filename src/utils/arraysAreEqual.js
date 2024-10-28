export const arraysAreEqual = (arr1, arr2) => {
  // Check if both arrays are the same length
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Sort both arrays
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  // Compare each element in the sorted arrays
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }

  // If no mismatches were found, the arrays are equal
  return true;
};
