import { Translation } from 'react-i18next';
export const eventAccessibilityFieldNames = {
  noteWrap: 'noteWrap',
};
export const eventAccessibilityOptions = [
  {
    type: 'contact',
    fieldNames: eventAccessibilityFieldNames.noteWrap,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.eventAccessibility.note')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.eventAccessibility.noteTooltip')}</Translation>,
  },
];
