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
