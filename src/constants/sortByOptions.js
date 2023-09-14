import { Translation } from 'react-i18next';

export const sortByOptions = [
  {
    label: <Translation>{(t) => t('dashboard.events.filter.sort.name')}</Translation>,
    key: `name`,
  },
  {
    label: <Translation>{(t) => t('dashboard.events.filter.sort.createdDate')}</Translation>,
    key: 'metadata.createdAt',
  },
  {
    label: <Translation>{(t) => t('dashboard.events.filter.sort.eventDate')}</Translation>,
    key: 'startDateTime',
  },
];

export const sortOrder = {
  ASC: 'asc',
  DESC: 'desc',
};

export const sortByOptionsOrgsPlacesPerson = [
  {
    label: <Translation>{(t) => t('dashboard.events.filter.sort.name')}</Translation>,
    key: `name`,
  },
];

export const sortByOptionsUsers = [
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.userName')}</Translation>,
    key: 'username',
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.firstName')}</Translation>,
    key: `firstname`,
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.lastName')}</Translation>,
    key: 'lastname',
  },
];
