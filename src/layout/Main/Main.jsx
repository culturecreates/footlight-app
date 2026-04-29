import React from 'react';
import './main.css';
import { Col, Grid, Row } from 'antd';

const { useBreakpoint } = Grid;

function Main(props) {
  const screens = useBreakpoint();

  const { children, entityReports, addButton } = props;

  // Check if entityReports and addButton are provided as props (new pattern for mobile-friendly layout)
  const hasNewLayoutProps = entityReports !== undefined || addButton !== undefined;

  const renderMobileHeader = () => {
    const titleElement = children?.length > 0 ? children[0] : children;

    return (
      <Row justify="space-between" gutter={[0, 12]} className="listing-header-row" style={{ marginBottom: '16px' }}>
        <Col className="listing-header-title-col">
          <Row align={'middle'} justify="space-between" wrap={false}>
            <Col>
              <div className="events-heading-wrapper">{titleElement}</div>
            </Col>
            {/* Mobile: Show EntityReports (3-dots) next to title */}
            {entityReports && <Col className="listing-header-dots-mobile">{entityReports}</Col>}
          </Row>
        </Col>
        {/* Mobile: Show AddButton below */}
        {(entityReports || addButton) && (
          <Col className="listing-header-actions-col" style={{ display: 'flex', gap: '12px' }}>
            {entityReports && <span className="listing-header-dots-desktop">{entityReports}</span>}
            {addButton}
          </Col>
        )}
      </Row>
    );
  };

  const renderLegacyHeader = () => {
    return (
      <Row justify="space-between" style={{ marginBottom: '16px' }}>
        <Col>
          <div className="events-heading-wrapper">{children?.length > 0 ? children[0] : children}</div>
        </Col>
        <Col>{children?.length > 1 && children[1]}</Col>
      </Row>
    );
  };

  // Get the correct children indices based on whether new layout props are used
  const getSearchChild = () => (hasNewLayoutProps ? children?.[1] : children?.[2]);
  const getSortChild = () => (hasNewLayoutProps ? children?.[2] : children?.[3]);
  const getFilterChild = () => (hasNewLayoutProps ? children?.[3] : children?.[4]);
  const getListChild = () => (hasNewLayoutProps ? children?.[4] : children?.[5]);

  return (
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-wrapper">
      <Col span={24}>
        <div className="listing-sticky-header">
          <Col style={{ paddingLeft: 0 }}>{hasNewLayoutProps ? renderMobileHeader() : renderLegacyHeader()}</Col>
          <Row gutter={[20, 10]} style={{ ...(!screens.md && { paddingRight: '4px', marginRight: 0 }) }}>
            <Col xs={24} sm={24} md={12} lg={10} xl={8} style={{ ...(!screens.md && { paddingRight: '0px' }) }}>
              {getSearchChild()}
            </Col>
            <Col>{getSortChild()}</Col>
          </Row>
          <Row
            gutter={[20, 10]}
            style={{ paddingTop: '20px', ...(!screens.md && { paddingRight: '4px', marginRight: 0 }) }}>
            <Col>
              <Row gutter={20}>{getFilterChild()}</Row>
            </Col>
          </Row>
        </div>
        <Row className="events-content">
          <Col flex="832px">{getListChild()}</Col>
        </Row>
      </Col>
    </Row>
  );
}

export default Main;
