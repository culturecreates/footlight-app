/**
 * Filters unedited fallback values based on the active fallback fields information.
 *
 * @param {Object} params - The function parameters.
 * @param {Object} params.values - The current set of values that need to be filtered.
 * @param {Object} [params.activeFallbackFieldsInfo={}] - An object containing fallback status information for fields, where keys represent specific field names and values contain details like `tagDisplayStatus` and `fallbackLiteralValue`.
 * @param {string} params.fieldName - The name of the field that needs to be matched against the fallback fields info.
 * @param {Object} params.additionalFilters - Object map that correspond to each language key in data and value corresponding if the value is to be included in the payload or not.
 *
 * @returns {Object} - A modified object with filtered values based on the fallback logic.
 */

export const filterUneditedFallbackValues = ({
  values,
  activeFallbackFieldsInfo = {},
  fieldName,
  additionalFilters,
}) => {
  let requiredFallbackKeyForCurrentField;

  // If activeFallbackFieldsInfo is empty, return the original values
  if (!(Object.keys(activeFallbackFieldsInfo).length > 0)) return emptyValueFilter(additionalFilters, values);

  // Determine the required fallback key for the current field
  Object.keys(activeFallbackFieldsInfo).forEach((key) => {
    const firstItemName = key.split('-');
    const fieldNameFlag = firstItemName[0].slice(0, -2);

    if (fieldName === fieldNameFlag) requiredFallbackKeyForCurrentField = key;
  });

  // If no matching fallback key is found, return the original values
  if (!requiredFallbackKeyForCurrentField) return emptyValueFilter(additionalFilters, values);

  let modifiedValues = {};

  // Add keys from values that are not fallback values
  const requiredFallbackStatusForCurrentField = activeFallbackFieldsInfo[requiredFallbackKeyForCurrentField];
  Object.keys(values).forEach((key) => {
    if (!Object.hasOwn(requiredFallbackStatusForCurrentField, key)) {
      modifiedValues[key] = values[key]?.trim();
    }
  });

  // Add fallback values for keys where tagDisplayStatus is false
  Object.keys(requiredFallbackStatusForCurrentField).forEach((key) => {
    if (!requiredFallbackStatusForCurrentField[key]?.tagDisplayStatus) {
      modifiedValues[key] = requiredFallbackStatusForCurrentField[key]?.fallbackLiteralValue?.trim();
    }
  });

  return emptyValueFilter(additionalFilters, modifiedValues);
};

const emptyValueFilter = (additionalFilters, modifiedValues) => {
  if (additionalFilters) {
    Object.keys(additionalFilters).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(modifiedValues, key)) {
        if (additionalFilters[key] === false) {
          delete modifiedValues[key];
        }
      }
    });
  }

  return modifiedValues;
};
