import { Translation } from 'react-i18next';

export const taxonomyClass = {
  EVENT: 'EVENT',
  PLACE: 'PLACE',
  ORGANIZATION: 'ORGANIZATION',
  PERSON: 'PERSON',
  // VIRTUAL_LOCATION: 'VIRTUAL_LOCATION',
};

export const taxonomyClassTranslations = [
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.selectType.classDropdownOptions.event')}</Translation>,
    key: 'Event',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.selectType.classDropdownOptions.place')}</Translation>,
    key: `Place`,
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.selectType.classDropdownOptions.organization')}</Translation>,
    key: 'Organization',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.selectType.classDropdownOptions.person')}</Translation>,
    key: 'Person',
  },
  // {
  //   label: <Translation>{(t) => t('dashboard.taxonomy.selectType.classDropdownOptions.virtualLocation')}</Translation>,
  //   key: 'Virtual_Location',
  // },
];
