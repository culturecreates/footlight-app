import React from 'react';
import { Row, Col } from 'antd';
import './event.css';

function Event(props) {
  const { title, required, hidden, marginTop, marginResponsive } = props;
  return (
    <Col span={24}>
      <Row>
        <Col
          className="add-event-section-col"
          flex={'780px'}
          style={{
            display: hidden && 'none',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
            ...(marginResponsive ? { margin: marginResponsive } : { margin: '0 16px' }),
          }}>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-content" justify="space-between">
            <Col flex={'488px'}>
              <div className="add-event-section-wrapper">
                {title && (
                  <Row>
                    <Col>
                      <div
                        className={`add-event-date-wrap ${required && 'title-required'}`}
                        data-cy={`section-title-${title}`}>
                        {title}
                      </div>
                    </Col>
                  </Row>
                )}
                {props?.children[0] ?? props?.children}
              </div>
            </Col>
            <Col flex={'253px'} className="responsive-view-control-class">
              <div className="side-wrapper-container" style={{ width: '100%', marginTop: marginTop && marginTop }}>
                {props?.children[1]}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Col>
  );
}

export default Event;
