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
  },
  {
    title: <Translation>{(t) => t('dashboard.events.publishState.draft')}</Translation>,
    value: eventPublishState.DRAFT,
    key: eventPublishState.DRAFT,
  },
  {
    title: <Translation>{(t) => t('dashboard.events.publishState.pendingReview')}</Translation>,
    value: eventPublishState.PENDING_REVIEW,
    key: eventPublishState.PENDING_REVIEW,
  },
];
