import { Translation } from 'react-i18next';

export const taxonomyClass = {
  EVENT: 'EVENT',
  PLACE: 'PLACE',
  ORGANIZATION: 'ORGANIZATION',
  PERSON: 'PERSON',
  VIRTUAL_LOCATION: 'VIRTUAL_LOCATION',
};

export const taxonomyClassTranslations = [
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.selectType.classDropdownOptions.event')}</Translation>,
    key: 'EVENT',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.selectType.classDropdownOptions.place')}</Translation>,
    key: `PLACE`,
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.selectType.classDropdownOptions.organization')}</Translation>,
    key: 'ORGANIZATION',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.selectType.classDropdownOptions.person')}</Translation>,
    key: 'PERSON',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.selectType.classDropdownOptions.virtualLocation')}</Translation>,
    key: 'VIRTUAL_LOCATION',
  },
];
