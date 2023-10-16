import { taxonomyClass } from '../constants/taxonomyClass';

export const standardFieldsForTaxonomy = (value, takenFields) => {
  let returnArr = [];
  const filter = (arr, taxonomyClass) => {
    arr.map((item) => {
      console.log(takenFields, item);

      takenFields.map((takenItem) => {
        if (item != takenItem?.mappedToField && taxonomyClass == takenItem?.taxonomyClass) {
          returnArr.push(item);
        }
      });
    });
  };
  if (value === taxonomyClass.EVENT) {
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
    return returnArr;
  } else if (value === taxonomyClass.PLACE) {
    const arr = ['PlaceAccessibility', 'Region', 'Type'];
    filter(arr, taxonomyClass.PLACE);
    return returnArr;
  } else if (value === taxonomyClass.VIRTUAL_LOCATION) {
    const arr = ['Type'];
    filter(arr, taxonomyClass.VIRTUAL_LOCATION);
    return returnArr;
  } else if (value === taxonomyClass.PERSON) {
    const arr = ['Occupation'];
    filter(arr, taxonomyClass.PERSON);
    return returnArr;
  } else {
    const arr = [];
    filter(arr, taxonomyClass.ORGANIZATION);
    return returnArr;
  }
};
