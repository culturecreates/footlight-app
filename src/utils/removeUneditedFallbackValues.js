export const removeUneditedFallbackValues = ({ values, activeFallbackFieldsInfo, fieldName, property }) => {
  if (values == '' || !values) {
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(activeFallbackFieldsInfo, fieldName)) {
    return values;
  }
  if (activeFallbackFieldsInfo[fieldName][property]?.tagDisplayStatus) {
    return;
  } else return values;
};
