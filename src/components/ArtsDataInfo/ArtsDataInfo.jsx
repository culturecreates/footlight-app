import React from 'react';
import './artsDataInfo.css';
import { Badge, Col, Row } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import Link from 'antd/lib/typography/Link';

function ArtsDataInfo(props) {
  const { artsDataLink, name, disambiguatingDescription } = props;
  return (
    <Row className="arts-data-info" align={'middle'} justify={'space-between'}>
      <Col span={20}>
        <Row gutter={[8, 0]} align={'middle'}>
          <Col className="arts-data-title" data-cy="col-artsdata-link">
            <Link href={artsDataLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <span style={{ textDecoration: 'underline', color: '#0f0e98' }} data-cy="span-artsdata-text">
                Artsdata
              </span>
            </Link>
          </Col>
          <Col className="arts-data-name">
            <span data-cy="span-artsdata-name">{name}</span>
          </Col>
          {disambiguatingDescription && (
            <>
              <Col>
                <span>
                  <Badge color="#1B3DE6" style={{ height: '2px', width: '2px' }} />
                </span>
              </Col>
              <Col className="arts-data-description" data-cy="col-artsdata-disambiguating-description">
                {disambiguatingDescription}
              </Col>
            </>
          )}
        </Row>
      </Col>
      <Col data-cy="artsdata-link-outlined-icon">
        <Link href={artsDataLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
          <span>
            <LinkOutlined style={{ color: '#0f0e98' }} />
          </span>
        </Link>
      </Col>
    </Row>
  );
}

export default ArtsDataInfo;
