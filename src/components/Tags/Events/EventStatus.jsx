import React, { useState, useEffect } from 'react';
import { Tag } from 'antd';
import './eventStatus.css';
import { eventPublishState } from '../../../constants/eventPublishState';
import { useTranslation } from 'react-i18next';
import { eventStatus } from '../../../constants/eventStatus';

function EventStatus(props) {
  const { t } = useTranslation();
  const [backgroundColor, setBackgroundColor] = useState();
  const [fontColor, setFontColor] = useState();
  const [label, setLabel] = useState();
  const eventStatusHandler = () => {
    switch (props?.label) {
      case eventPublishState.PUBLISHED:
        setBackgroundColor('#DEF3D6');
        setFontColor('#1D8221');
        setLabel(t('dashboard.events.publishState.published'));
        break;
      case eventPublishState.DRAFT:
        setBackgroundColor('#E8E8E8');
        setFontColor('#222732');
        setLabel(t('dashboard.events.publishState.draft'));
        break;
      case eventPublishState.PENDING_REVIEW:
        setBackgroundColor('#FFF7CC');
        setFontColor('#B59800');
        setLabel(t('dashboard.events.publishState.pendingReview'));
        break;
      case eventStatus.EventPostponed:
        setBackgroundColor('#EDAB01');
        setFontColor('#FFFFFF');
        setLabel(t('dashboard.events.addEditEvent.dates.eventPostponed'));
        break;
      case eventStatus.EventCancelled:
        setBackgroundColor('#CE1111');
        setFontColor('#FFFFFF');
        setLabel(t('dashboard.events.addEditEvent.dates.eventCancelled'));
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    eventStatusHandler();
  }, [props.label]);

  return (
    <Tag
      {...props}
      color={backgroundColor}
      className="event-status-tag"
      style={{ color: fontColor, display: 'grid', placeContent: 'center' }}>
      {label}
    </Tag>
  );
}

export default EventStatus;
