import React from 'react';
import './list.css';
import { Row, Col } from 'antd';

function List() {
  return (
    <Row className="event-listing-wrapper">
      <Col>
        <img className="event-list-image" />
      </Col>{' '}
      <Col>
        <Row>
          <Col>date</Col>
          <Col>events</Col>
        </Row>
        <Row>
          <Col>Title</Col>
        </Row>
        <Row>
          <Col>Place</Col>
        </Row>
      </Col>{' '}
      <Col className="event-info-section">
        <Row>
          <Col>empty</Col>
        </Row>
        <Row>
          <Col>status</Col>
        </Row>
        <Row>
          <Col>Created</Col>
        </Row>
        <Row>
          <Col>Updated</Col>
        </Row>
      </Col>
      <Col span={2}>options</Col>
    </Row>
  );
}

export default List;
