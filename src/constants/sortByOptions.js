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
    key: 'upcomingEventDate',
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
    key: 'userName',
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.firstName')}</Translation>,
    key: `firstName`,
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.lastName')}</Translation>,
    key: 'lastName',
  },
];
