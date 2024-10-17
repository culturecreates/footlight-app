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
    label: <Translation>{(t) => t('dashboard.events.filter.sort.dateModified')}</Translation>,
    key: 'metadata.modifiedAt',
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
    ['data-cy']: 'name',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.listing.sort.createdDate')}</Translation>,
    key: 'metadata.createdAt',
    ['data-cy']: 'createdDate',
  },
  {
    label: <Translation>{(t) => t('dashboard.events.filter.sort.dateModified')}</Translation>,
    key: 'metadata.modifiedAt',
    ['data-cy']: 'modifiedAt',
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
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.dateInvited')}</Translation>,
    key: 'invitedOn',
  },
];

export const sortByOptionsTaxonomy = [
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.listing.sort.name')}</Translation>,
    key: 'name',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.listing.sort.createdDate')}</Translation>,
    key: 'metadata.createdAt',
  },
  {
    label: <Translation>{(t) => t('dashboard.events.filter.sort.dateModified')}</Translation>,
    key: 'metadata.modifiedAt',
  },
];
