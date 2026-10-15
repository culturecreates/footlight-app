import { Translation } from 'react-i18next';

export const eventPublishOptions = [
  {
    label: (
      <span data-cy="event-action-menu-item" data-action="publish">
        <Translation>{(t) => t('dashboard.events.publishOptions.publishEvent')}</Translation>
      </span>
    ),
    key: '0',
  },
  {
    label: (
      <span data-cy="event-action-menu-item" data-action="revert-to-draft">
        <Translation>{(t) => t('dashboard.events.publishOptions.revertToDraft')}</Translation>
      </span>
    ),
    key: '6',
  },
  {
    label: (
      <span data-cy="event-action-menu-item" data-action="unpublish">
        <Translation>{(t) => t('dashboard.events.publishOptions.unpublishEvent')}</Translation>
      </span>
    ),
    key: '1',
  },
  {
    label: (
      <span data-cy="event-action-menu-item" data-action="feature">
        <Translation>{(t) => t('dashboard.events.publishOptions.featureEvent')}</Translation>
      </span>
    ),
    key: '4',
  },
  {
    label: (
      <span data-cy="event-action-menu-item" data-action="unfeature">
        <Translation>{(t) => t('dashboard.events.publishOptions.unFeatureEvent')}</Translation>
      </span>
    ),
    key: '5',
  },
  {
    type: 'divider',
  },
  {
    label: (
      <span data-cy="event-action-menu-item" data-action="duplicate">
        <Translation>{(t) => t('dashboard.events.publishOptions.duplicateEvent')}</Translation>
      </span>
    ),
    key: '3',
  },
  {
    label: (
      <span data-cy="event-action-menu-item" data-action="delete">
        <Translation>{(t) => t('dashboard.events.publishOptions.deleteEvent')}</Translation>
      </span>
    ),
    key: '2',
  },
];
