import { EVENT, PERSON, PLACE } from '../constants/standardFieldsTranslations';
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
              item?.key.toLowerCase() === takenItem?.mappedToField.toLowerCase() &&
              taxonomyClass.toLowerCase() === takenItem?.taxonomyClass.toLowerCase()
            ) {
              returnArr = returnArr.filter((e) => e?.key !== item.key);
            }
          }
        });
      });
    }
  };

  if (value.toLowerCase() === taxonomyClass.EVENT.toLowerCase()) {
    filter(EVENT, taxonomyClass.EVENT);
    return [...new Set(returnArr)];
  } else if (value.toLowerCase() === taxonomyClass.PLACE.toLowerCase()) {
    filter(PLACE, taxonomyClass.PLACE);
    return [...new Set(returnArr)];
  } else if (value.toLowerCase() === taxonomyClass.VIRTUAL_LOCATION.toLowerCase()) {
    filter([], taxonomyClass.VIRTUAL_LOCATION);
    return [...new Set(returnArr)];
  } else if (value.toLowerCase() === taxonomyClass.PERSON.toLowerCase()) {
    filter(PERSON, taxonomyClass.PERSON);
    return [...new Set(returnArr)];
  } else {
    const arr = [];
    filter(arr, taxonomyClass.ORGANIZATION);
    return [...new Set(returnArr)];
  }
};

export const getStandardFieldArrayForClass = (value) => {
  let arr = [];
  switch (value.toUpperCase()) {
    case taxonomyClass.PERSON:
      arr = PERSON;
      break;
    case taxonomyClass.EVENT:
      arr = EVENT;
      break;
    case taxonomyClass.PLACE:
      arr = PLACE;
      break;
    default:
      break;
  }
  return arr;
};
