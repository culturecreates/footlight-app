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
        <Row gutter={[20, 10]}>
          <Col xs={24} sm={24} md={12} lg={10} xl={8}>
            {children?.length > 2 && children[2]}
          </Col>
          <Col>{children?.length > 3 && children[3]}</Col>

          <Col>
            <Row gutter={20}>
              {children?.length > 4 && children[4]}

              {/* <Space>
                <Col>
                  <SearchableCheckbox
                    onFilterChange={(values) => onFilterChange(values, filterTypes.PUBLICATION)}
                    data={eventPublishStateOptions?.map((publication) => {
                      return {
                        key: publication.key,
                        label: (
                           <Checkbox value={publication.value} key={publication.key} style={{ marginLeft: '8px' }}>
                            {publication.title}
                          </Checkbox>
                        ),
                        filtervalue: publication.value,
                      };
                    })}
                    value={filter?.publication}>
                    <Button
                      size="large"
                      className="filter-buttons"
                      style={{ borderColor: filter?.publication?.length > 0 && '#607EFC' }}>
                      {t('dashboard.events.filter.publication.label')}
                      {filter?.publication?.length > 0 && (
                        <>
                          &nbsp;
                          <Badge count={filter?.publication?.length} showZero={false} color="#1B3DE6" />
                        </>
                      )}
                    </Button>
                  </SearchableCheckbox>
                </Col>
              </Space> */}
              {/* <Col>
                <SearchableCheckbox
                  allowSearch={true}
                  overlayStyle={{ height: '304px' }}
                  data={userFilterData?.map((userDetail) => {
                    return {
                      key: userDetail?.id,
                      label: (
                        <>
                          <Checkbox
                            value={userDetail?.id}
                            key={userDetail?.id}
                            style={{ marginLeft: '8px' }}
                            onChange={(e) => onCheckboxChange(e)}>
                            {user?.id == userDetail?.id
                              ? t('dashboard.events.filter.users.myEvents')
                              : userDetail?.firstName?.charAt(0)?.toLowerCase() + userDetail?.lastName?.toLowerCase()}
                          </Checkbox>
                          {user?.id == userDetail?.id && <Divider style={{ margin: 8 }} />}
                        </>
                      ),
                      filtervalue: userDetail?.firstName?.charAt(0)?.toLowerCase() + userDetail?.lastName,
                    };
                  })}
                  value={userFilter}>
                  <Button
                    size="large"
                    className="filter-buttons"
                    style={{ borderColor: userFilter?.length > 0 && '#607EFC' }}>
                    {t('dashboard.events.filter.users.label')}
                    {userFilter?.length > 0 && (
                      <>
                        &nbsp; <Badge count={userFilter?.length} showZero={false} color="#1B3DE6" />
                      </>
                    )}
                  </Button>
                </SearchableCheckbox>
              </Col>
              <Col>
                <Popover
                  placement="bottom"
                  getPopupContainer={(trigger) => trigger.parentNode}
                  content={
                    <DateRangePicker
                      value={selectedDates}
                      onChange={(dates) => {
                        setSelectedDates(dates);
                        setFilter({ ...filter, dates: dates });
                      }}
                      onOpenChange={(open) => setIsPopoverOpen(open)}
                      renderExtraFooter={() => (
                        <div className="date-range-picker-filter-footer">
                          <Button
                            type="text"
                            className={`date-range-picker-filter-footer-label ${
                              filter?.dates?.length == 2 &&
                              filter?.dates[0] === 'any' &&
                              filter?.dates[1] === 'any' &&
                              'date-range-picker-filter-footer-button-selected'
                            }`}
                            onClick={() => {
                              setSelectedDates([]);
                              setFilter({ ...filter, dates: ['any', 'any'] });
                              setIsPopoverOpen(false);
                            }}>
                            {t('dashboard.events.filter.dates.allTime')}
                          </Button>
                          <Button
                            type="text"
                            className={`date-range-picker-filter-footer-label ${
                              filter?.dates?.length == 2 &&
                              filter?.dates[0] === 'any' &&
                              filter?.dates[1] !== 'any' &&
                              'date-range-picker-filter-footer-button-selected'
                            }`}
                            onClick={() => {
                              setSelectedDates([]);
                              setFilter({ ...filter, dates: ['any', moment().subtract(1, 'days')] });
                              setIsPopoverOpen(false);
                            }}>
                            {t('dashboard.events.filter.dates.past')}
                          </Button>
                        </div>
                      )}
                    />
                  }
                  trigger="click"
                  overlayClassName="date-filter-popover"
                  open={isPopoverOpen}
                  onOpenChange={handlePopoverOpenChange}>
                  <Button
                    size="large"
                    className="filter-buttons"
                    style={{ borderColor: filter?.dates?.length > 0 > 0 && '#607EFC' }}>
                    {t('dashboard.events.filter.dates.dates')}
                    {filter?.dates?.length > 0 && (
                      <>
                        &nbsp; <Badge color="#1B3DE6" />
                      </>
                    )}
                  </Button>
                </Popover>
              </Col>
              <Col>
                {(userFilter.length > 0 ||
                  filter?.publication?.length > 0 ||
                  filter?.dates?.length > 0 ||
                  filter?.order === sortOrder?.DESC ||
                  filter?.sort != sortByOptions[2]?.key) && (
                  <Button
                    size="large"
                    className="filter-buttons"
                    style={{ color: '#1B3DE6' }}
                    onClick={filterClearHandler}>
                    {t('dashboard.events.filter.clear')}&nbsp;
                    <CloseCircleOutlined style={{ color: '#1B3DE6', fontSize: '16px' }} />
                  </Button>
                )}
              </Col> */}
            </Row>
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
