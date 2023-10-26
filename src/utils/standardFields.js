import { taxonomyClass } from '../constants/taxonomyClass';

export const standardFieldsForTaxonomy = (value, takenFields) => {
  if (value === undefined) {
    value = taxonomyClass.EVENT;
  }
  let returnArr = [];
  const filter = (arr, taxonomyClass) => {
    returnArr = arr;
    arr.map((item) => {
      takenFields.map((takenItem) => {
        if (
          item === takenItem?.mappedToField &&
          taxonomyClass.toLowerCase() === takenItem?.taxonomyClass.toLowerCase() &&
          takenItem?.mappedToField !== null
        ) {
          returnArr = returnArr.filter((e) => e !== item);
        }
      });
    });
  };

  if (value.toLowerCase() === taxonomyClass.EVENT.toLowerCase()) {
    const arr = [
      'EventAccessibility',
      'Audience',
      'EventType',
      'OrganizerRole',
      'PerformerRole',
      'SupporterRole',
      'inLanguage',
    ];
    filter(arr, taxonomyClass.EVENT);
    return [...new Set(returnArr)];
  } else if (value.toLowerCase() === taxonomyClass.PLACE.toLowerCase()) {
    const arr = ['PlaceAccessibility', 'Region', 'Type'];
    filter(arr, taxonomyClass.PLACE);
    return [...new Set(returnArr)];
  } else if (value.toLowerCase() === taxonomyClass.VIRTUAL_LOCATION.toLowerCase()) {
    const arr = ['Type'];
    filter(arr, taxonomyClass.VIRTUAL_LOCATION);
    return [...new Set(returnArr)];
  } else if (value.toLowerCase() === taxonomyClass.PERSON.toLowerCase()) {
    const arr = ['Occupation'];
    filter(arr, taxonomyClass.PERSON);
    return [...new Set(returnArr)];
  } else {
    const arr = [];
    filter(arr, taxonomyClass.ORGANIZATION);
    return [...new Set(returnArr)];
  }
};
