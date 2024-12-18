import React from 'react';
import './main.css';
import { Col, Grid, Row } from 'antd';

const { useBreakpoint } = Grid;

function Main(props) {
  const screens = useBreakpoint();

  const { children } = props;
  return (
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-wrapper">
      <Col span={24}>
        <Col style={{ paddingLeft: 0, ...(!screens.md && { marginBottom: '16px' }) }}>
          <Row justify="space-between">
            <Col>
              <div className="events-heading-wrapper">{children?.length > 0 ? children[0] : children}</div>
            </Col>

            <Col> {children?.length > 1 && children[1]}</Col>
          </Row>
        </Col>
        <Row gutter={[20, 10]} style={{ ...(!screens.md && { paddingRight: '4px', marginRight: 0 }) }}>
          <Col xs={24} sm={24} md={12} lg={10} xl={8} style={{ ...(!screens.md && { paddingRight: '0px' }) }}>
            {children?.length > 2 && children[2]}
          </Col>
          <Col>{children?.length > 3 && children[3]}</Col>
        </Row>
        <Row style={{ paddingTop: 16 }}>
          <Col>
            <Row gutter={20}>{children?.length > 4 && children[4]}</Row>
          </Col>
        </Row>
        <Row className="events-content">
          <Col flex="832px">{children?.length > 5 && children[5]}</Col>
        </Row>
      </Col>
    </Row>
  );
}

export default Main;
