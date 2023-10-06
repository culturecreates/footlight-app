import { taxonomyClass } from '../constants/taxonomyClass';

export const standardFieldsForTaxonomy = (value) => {
  if (value === taxonomyClass.EVENT) {
    return [
      'EventAccessibility',
      'Audience',
      'EventType',
      'OrganizerRole',
      'PerformerRole',
      'SupporterRole',
      'inLanguage',
    ];
  } else if (value === taxonomyClass.PLACE) {
    return ['PlaceAccessibility', 'Region', 'Type'];
  } else if (value === taxonomyClass.VIRTUAL_LOCATION) {
    return ['Type'];
  } else if (value === taxonomyClass.PERSON) {
    return ['Occupation'];
  } else {
    return [];
  }
};
