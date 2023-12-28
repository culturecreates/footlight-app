import { Translation } from 'react-i18next';

export const placeAccessibilityTypeOptionsFieldNames = {
  ACCESSIBILITY_NOTE_WRAP: 'accessibilityNotewrap',
};
export const placeAccessibilityTypeOptions = [
  {
    type: 'accessibilityNotewrap',
    fieldNames: placeAccessibilityTypeOptionsFieldNames.ACCESSIBILITY_NOTE_WRAP,
    disabled: false,
    label: (
      <Translation>
        {(t) => t('dashboard.places.createNew.addPlace.venueAccessibility.placeAccessibilityNote.note')}
      </Translation>
    ),
    tooltip: (
      <Translation>
        {(t) => t('dashboard.places.createNew.addPlace.venueAccessibility.placeAccessibilityNote.tooltip')}
      </Translation>
    ),
  },
];
