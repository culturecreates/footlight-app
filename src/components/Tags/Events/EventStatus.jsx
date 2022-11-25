import React, { useState, useEffect } from 'react';
import { Tag } from 'antd';
import './eventStatus.css';

function EventStatus(props) {
  const [backgroundColor, setBackgroundColor] = useState();
  const [fontColor, setFontColor] = useState();
  const eventStatusHandler = () => {
    if (props.label.toLowerCase() === 'published' || props.label.toLowerCase() === 'publié') {
      setBackgroundColor('#DBF3FD');
      setFontColor('#1572BB');
    } else if (props.label.toLowerCase() === 'draft' || props.label.toLowerCase() === 'brouillon') {
      setBackgroundColor('#E8E8E8');
      setFontColor('#222732');
    } else if (
      props.label.toLowerCase() === 'waiting for approval' ||
      props.label.toLowerCase() === 'pending review' ||
      props.label.toLowerCase() === 'attente d’approbation'
    ) {
      setBackgroundColor('#FFF7CC');
      setFontColor('#B59800');
    }
  };
  useEffect(() => {
    eventStatusHandler();
  }, [props.label]);

  return (
    <Tag {...props} color={backgroundColor} className="event-status-tag" style={{ color: fontColor }}>
      {props.label}
    </Tag>
  );
}

export default EventStatus;
