import React from 'react';
import './artsDataInfo.css';
import { Badge, Col, Row } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

function ArtsDataInfo(props) {
  const { artsDataLink, name, disambiguatingDescription } = props;
  return (
    <Row className="arts-data-info" align={'middle'} justify={'space-between'}>
      <Col span={20}>
        <Row gutter={[4, 0]} align={'middle'}>
          <Col
            className="arts-data-title"
            onClick={() => window.open(`${artsDataLink}`, '_blank', 'noopener,noreferrer')}>
            <span style={{ textDecoration: 'underline' }}>Artsdata</span>
          </Col>
          <Col className="arts-data-name">
            <span>{name}</span>
          </Col>
          <Col>
            <span>
              <Badge color="#1B3DE6" style={{ height: '2px', width: '2px' }} />
            </span>
          </Col>
          <Col className="arts-data-description">{disambiguatingDescription}</Col>
        </Row>
      </Col>
      <Col onClick={() => window.open(`${artsDataLink}`, '_blank', 'noopener,noreferrer')}>
        <span>
          <LinkOutlined />
        </span>
      </Col>
    </Row>
  );
}

export default ArtsDataInfo;
