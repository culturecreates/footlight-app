import { Button, Row, Col } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './createNew.css';

const NewEntityLayout = ({ children, heading, text, entityName }) => {
  const navigate = useNavigate();

  return (
    <Row className="create-new-entity-page" gutter={[0, 24]}>
      <Col span={24}>
        <div className="button-container">
          <Button type="link" onClick={navigate(-1)}>
            back to previous screen
          </Button>
        </div>
        <h1 className="heading"> {heading}</h1>
      </Col>

      <Col className="content" span={16}>
        <Col span={24}>
          <h2 className="sub-heading">Search for another instance</h2>
          <p>{text}</p>
        </Col>
        <Col span={24} className="search">
          <p>{entityName}</p>
          {children}
        </Col>
      </Col>
    </Row>
  );
};

export default NewEntityLayout;
