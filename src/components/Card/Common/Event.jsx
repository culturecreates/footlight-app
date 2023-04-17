import React from 'react';
import { Row, Col } from 'antd';

function Event(props) {
  const { title, required, hidden } = props;
  return (
    <Col flex={'780px'} className="add-event-section-col" style={{ display: hidden && 'none' }}>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-content">
        <Col flex={'423px'}>
          <div className="add-event-section-wrapper">
            {title && (
              <Row>
                <Col>
                  <div className={`add-event-date-wrap ${required && 'title-required'}`}>{title}</div>
                </Col>
              </Row>
            )}
            {props?.children[0] ?? props?.children}
          </div>
        </Col>
        <Col flex={'253px'}>
          <div style={{ width: '100%', marginTop: '35%' }}>{props?.children[1]}</div>
        </Col>
      </Row>
    </Col>
  );
}

export default Event;
