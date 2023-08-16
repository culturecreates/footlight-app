import { Button, Row, Col } from 'antd';
import React from 'react';
import './createNew.css';

const NewEntityLayout = ({ children, heading, text, entityName }) => {
  return (
    <Row className="create-new-entity-page">
      <Col span={24}>
        <div className="button-container">
          <Button type="link">back to previous screen</Button>
        </div>
        <h1 className="heading"> {heading}</h1>
      </Col>

      <Row className="content">
        <Col span={24}>
          <h2 className="sub-heading">Search for another instance</h2>
          <p>{text}</p>
        </Col>
        <Col span={24} className="search">
          <p>{entityName}</p>
          {children}
        </Col>
      </Row>
    </Row>
  );
};

export default NewEntityLayout;
