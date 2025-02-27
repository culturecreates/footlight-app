import { EVENT, ORGANIZATION, PERSON, PLACE } from '../constants/standardFieldsTranslations';
import { taxonomyClass } from '../constants/taxonomyClass';

export const standardFieldsForTaxonomy = (value, takenFields) => {
  if (value === undefined) {
    return [];
  }
  let returnArr = [];
  const filter = (arr, taxonomyClass) => {
    returnArr = arr;
    if (arr.length > 0) {
      arr.map((item) => {
        takenFields.map((takenItem) => {
          if (takenItem?.mappedToField !== null) {
            if (
              item?.key?.toLowerCase() === takenItem?.mappedToField?.toLowerCase() &&
              taxonomyClass?.toLowerCase() === takenItem?.taxonomyClass?.toLowerCase()
            ) {
              returnArr = returnArr.filter((e) => e?.key !== item.key);
            }
          }
        });
      });
    }
  };

  if (value?.toLowerCase() === taxonomyClass.EVENT?.toLowerCase()) {
    filter(EVENT, taxonomyClass.EVENT);
    return [...new Set(returnArr)];
  } else if (value.toLowerCase() === taxonomyClass.PLACE?.toLowerCase()) {
    filter(PLACE, taxonomyClass.PLACE);
    return [...new Set(returnArr)];
  } else if (value.toLowerCase() === taxonomyClass.PERSON?.toLowerCase()) {
    filter(PERSON, taxonomyClass.PERSON);
    return [...new Set(returnArr)];
  } else {
    filter(ORGANIZATION, taxonomyClass.ORGANIZATION);
    return [...new Set(returnArr)];
  }
};

export const getStandardFieldArrayForClass = (value) => {
  const taxonomyMap = {
    [taxonomyClass.PERSON]: PERSON,
    [taxonomyClass.EVENT]: EVENT,
    [taxonomyClass.PLACE]: PLACE,
    [taxonomyClass.ORGANIZATION]: ORGANIZATION,
  };

  return taxonomyMap[value?.toUpperCase()] || [];
};

export const getStandardFieldTranslation = ({ value, classType }) => {
  const taxonomyMap = {
    [taxonomyClass.PERSON]: PERSON,
    [taxonomyClass.EVENT]: EVENT,
    [taxonomyClass.PLACE]: PLACE,
    [taxonomyClass.ORGANIZATION]: ORGANIZATION,
  };

  const fieldList = taxonomyMap[classType?.toUpperCase()];
  return fieldList?.find((s) => s.key === value);
};
