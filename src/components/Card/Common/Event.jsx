import React from 'react';
import { Row, Col } from 'antd';
import './event.css';

function Event(props) {
  const { title, required, hidden, marginTop } = props;
  return (
    <Col
      className="add-event-section-col"
      flex={'780px'}
      style={{ display: hidden && 'none', borderRadius: '4px', backgroundColor: '#ffffff', margin: '0 16px' }}>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-content" justify="space-between">
        <Col flex={'423px'}>
          <div className="add-event-section-wrapper">
            {title && (
              <Row>
                <Col>
                  <div className={`add-event-date-wrap ${required && 'title-required'}`} data-cy="section-title">
                    {title}
                  </div>
                </Col>
              </Row>
            )}
            {props?.children[0] ?? props?.children}
          </div>
        </Col>
        <Col flex={'253px'}>
          <div style={{ width: '100%', marginTop: marginTop ? marginTop : '35%' }}>{props?.children[1]}</div>
        </Col>
      </Row>
    </Col>
  );
}

export default Event;
