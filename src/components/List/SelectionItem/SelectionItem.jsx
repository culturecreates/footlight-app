import React from 'react';
import './selectionItem.css';
import { Avatar, List, Button, Row, Col } from 'antd';
import { CloseCircleOutlined, LinkOutlined } from '@ant-design/icons';

function SelectionItem(props) {
  const { icon, name, description, bordered, closable, onClose, itemWidth, address, accessibility } = props;
  return (
    <div
      className="selection-item-wrapper"
      style={{ border: bordered && '1px solid#607EFC', width: itemWidth && itemWidth }}>
      <List.Item
        className="selection-item-list-wrapper"
        actions={[
          closable && (
            <Button type="text" key="list-loadmore-close" onClick={onClose}>
              <CloseCircleOutlined style={{ color: '#1b3de6' }} />
            </Button>
          ),
        ]}>
        <List.Item.Meta
          style={{ alignItems: 'center' }}
          avatar={
            <Avatar
              shape="square"
              icon={icon}
              style={{
                backgroundColor: '#E3E8FF',
                borderRadius: '4px',
              }}
            />
          }
          title={<span className="selection-item-title">{name}</span>}
          description={<span className="selection-item-subheading">{description}</span>}
        />
      </List.Item>
      {(address || accessibility) && (
        <Row gutter={[28, 0]} align="top">
          <Col flex="190px">
            <Row>
              <Col>
                <span className="selection-item-sub-title">Adresse postale</span>
              </Col>
            </Row>
            <Row>
              <Col>
                <span className="selection-item-sub-content">1234 rue street, Montréal, QC H2X 1Y9</span>
              </Col>
            </Row>
          </Col>
          <Col flex="150px">
            <Row>
              <Col>
                <span className="selection-item-sub-title">Accessibilité du lieu</span>
              </Col>
            </Row>
            <Row>
              <Col>
                <span className="selection-item-sub-content">Ascenseur, lorem</span>
                <p>
                  <a
                    href={'#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="selection-item-sub-content"
                    style={{ color: '#0F0E98' }}>
                    <span className="open-hour-url-link">hia</span>&nbsp;
                    <LinkOutlined />
                  </a>
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default SelectionItem;
