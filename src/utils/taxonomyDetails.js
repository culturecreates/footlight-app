import { bilingual } from './bilingual';

// Function to get the required taxonomy fields or details.

export const taxonomyDetails = (data, user, mappedToField, field = false, isDynamicField = false) => {
  let fieldData = data?.filter((taxonomy) => {
    if (taxonomy?.isDynamicField) {
      if (taxonomy?.isDynamicField == isDynamicField && taxonomy?.mappedToField === mappedToField) return true;
    } else if (taxonomy?.mappedToField === mappedToField) return true;
  });
  if (fieldData && fieldData?.length > 0 && fieldData[0]) {
    if (!field) return fieldData[0];
    else {
      let selectedField = Object?.keys(fieldData[0])?.filter((fields) => {
        if (field?.toLowerCase() === fields?.toLowerCase()) return true;
        else return false;
      });
      if (selectedField && selectedField[0]) {
        if (selectedField[0] === 'name') {
          return bilingual({
            data: fieldData[0]?.name,
            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          });
        } else
          return {
            [selectedField[0]]: fieldData[0][selectedField[0]],
          };
      } else return fieldData[0];
    }
  }
};
