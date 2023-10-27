import { Translation } from 'react-i18next';

export const eventPublishOptions = [
  {
    label: <Translation>{(t) => t('dashboard.events.publishOptions.publishEvent')}</Translation>,
    key: '0',
  },
  {
    label: <Translation>{(t) => t('dashboard.events.publishOptions.unpublishEvent')}</Translation>,
    key: '1',
  },
  {
    label: <Translation>{(t) => t('dashboard.events.publishOptions.featureEvent')}</Translation>,
    key: '4',
  },
  {
    label: <Translation>{(t) => t('dashboard.events.publishOptions.unFeatureEvent')}</Translation>,
    key: '5',
  },
  {
    type: 'divider',
  },
  {
    label: <Translation>{(t) => t('dashboard.events.publishOptions.duplicateEvent')}</Translation>,
    key: '3',
  },
  {
    label: <Translation>{(t) => t('dashboard.events.publishOptions.deleteEvent')}</Translation>,
    key: '2',
  },
];
