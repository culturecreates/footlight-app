import React from 'react';
import { Col, Row } from 'antd';
// import EventList from '../../../components/Events/List';

function Events() {
  return (
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
      <Col span={18} style={{ backgroundColor: 'red' }}>
        <Row>
          <Col xs={2} sm={4} md={6} lg={8} xl={10}>
            Heading
          </Col>
        </Row>
        <Row>
          <Col xs={2} sm={4} md={6} lg={8} xl={10}>
            Search
          </Col>
        </Row>
        <Row>
          <Col xs={2} sm={4} md={6} lg={8} xl={10}>
            listing
          </Col>
        </Row>
      </Col>
      <Col span={4} offset={2}>
        col-6
      </Col>
    </Row>
  );
}

export default Events;
