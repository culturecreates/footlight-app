import React, { useState, useEffect } from 'react';
import { Tag } from 'antd';
import './eventStatus.css';
import { eventPublishState } from '../../../constants/eventPublishState';
import { useTranslation } from 'react-i18next';

function EventStatus(props) {
  const { t } = useTranslation();
  const [backgroundColor, setBackgroundColor] = useState();
  const [fontColor, setFontColor] = useState();
  const [label, setLabel] = useState();
  const eventStatusHandler = () => {
    switch (props?.label) {
      case eventPublishState.PUBLISHED:
        setBackgroundColor('#DBF3FD');
        setFontColor('#1572BB');
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
      default:
        break;
    }
  };
  useEffect(() => {
    eventStatusHandler();
  }, [props.label]);

  return (
    <Tag {...props} color={backgroundColor} className="event-status-tag" style={{ color: fontColor }}>
      {label}
    </Tag>
  );
}

export default EventStatus;
