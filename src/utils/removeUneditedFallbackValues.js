export const filterUneditedFallbackValues = ({ values, activeFallbackFieldsInfo = {}, fieldName }) => {
  let requiredFallbackKeyForCurrentField;
  if (!(Object.keys(activeFallbackFieldsInfo).length > 0)) return values;

  Object.keys(activeFallbackFieldsInfo).forEach((key) => {
    const firstItemName = key.split('-');
    const fieldNameFlag = firstItemName[0].slice(0, -2);

    if (fieldName === fieldNameFlag) requiredFallbackKeyForCurrentField = key;
  });
  if (!requiredFallbackKeyForCurrentField) return values;

  let modifiedValues = {};

  const requiredFallbackStatusForCurrentField = activeFallbackFieldsInfo[requiredFallbackKeyForCurrentField];
  Object.keys(values).forEach((key) => {
    if (!Object.hasOwn(requiredFallbackStatusForCurrentField, key)) {
      modifiedValues[key] = values[key]?.trim();
    }
  });

  Object.keys(requiredFallbackStatusForCurrentField).forEach((key) => {
    if (!requiredFallbackStatusForCurrentField[key]?.tagDisplayStatus) {
      modifiedValues[key] = requiredFallbackStatusForCurrentField[key]?.fallbackLiteralValue?.trim();
    }
  });

  return modifiedValues;
};
