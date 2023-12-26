import { Translation } from 'react-i18next';

export const eventPublishState = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  PENDING_REVIEW: 'PendingReview',
};

export const eventPublishStateOptions = [
  {
    title: <Translation>{(t) => t('dashboard.events.publishState.published')}</Translation>,
    value: eventPublishState.PUBLISHED,
    key: eventPublishState.PUBLISHED,
    infoText: <Translation>{(t) => t('dashboard.events.readOnlyEvent.notification.underPublished')}</Translation>,
  },
  {
    title: <Translation>{(t) => t('dashboard.events.publishState.draft')}</Translation>,
    value: eventPublishState.DRAFT,
    key: eventPublishState.DRAFT,
    infoText: '',
  },
  {
    title: <Translation>{(t) => t('dashboard.events.publishState.pendingReview')}</Translation>,
    value: eventPublishState.PENDING_REVIEW,
    key: eventPublishState.PENDING_REVIEW,
    infoText: <Translation>{(t) => t('dashboard.events.readOnlyEvent.notification.underReview')}</Translation>,
  },
];
