import { Button, Col, Dropdown, Grid, List, Row, Space } from 'antd';
import i18next from 'i18next';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { createSearchParams, useParams, useSearchParams } from 'react-router-dom';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NoContent from '../../../components/NoContent/NoContent';
import { sortByOptionsTaxonomy, sortOrder } from '../../../constants/sortByOptions';
import ReadOnlyProtectedComponent from '../../../layout/ReadOnlyProtectedComponent';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useLazyGetAllTaxonomyQuery } from '../../../services/taxonomy';
import UserSearch from '../../../components/Search/Events/EventsSearch';
import AddEvent from '../../../components/Button/AddEvent';
import { SortAscendingOutlined, SortDescendingOutlined, DownOutlined, CloseCircleOutlined } from '@ant-design/icons';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import './taxonomy.css';

const Taxonomy = () => {
  const { useBreakpoint } = Grid;

  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  let [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector(getUserDetails);
  const { t } = useTranslation();
  const screens = useBreakpoint();

  const [getAllTaxonomy, { currentData: allTaxonomy, isFetching: isTaxonomyFetching }] =
    useLazyGetAllTaxonomyQuery(timestampRef);

  const sortByParam = searchParams.get('sortBy');
  const orderParam = searchParams.get('order');
  const queryParam = searchParams.get('query');

  const defaultSort = sortByParam || sessionStorage.getItem('sortByTaxonomy') || `${sortByOptionsTaxonomy[0].key}`;
  const defaultOrder = orderParam || sessionStorage.getItem('orderTaxonomy') || sortOrder?.ASC;
  const defaultQuery = queryParam || sessionStorage.getItem('queryTaxonomy') || '';

  const [filters, setFilters] = useState({
    sort: decodeURIComponent(defaultSort),
    order: decodeURIComponent(defaultOrder),
    query: decodeURIComponent(defaultQuery),
  });
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    const filtersDecoded = setFiletrsForApiCall();
    setPageNumber(1);
    getAllTaxonomy({
      calendarId,
      query: filters.query,
      filters: filtersDecoded,
      page: 1,
      limit: 10,
      sessionId: timestampRef,
    });

    let params = {
      page: pageNumber,
      order: filters?.order,
      sortBy: filters?.sort,
      ...(filters.query !== '' && { query: filters.query }),
    };
    setSearchParams(createSearchParams(params));
    sessionStorage.setItem('pageTaxonomy', pageNumber);

    sessionStorage.setItem('queryTaxonomy', filters.query);
    sessionStorage.setItem('orderTaxonomy', filters?.order);
    sessionStorage.setItem('sortByTaxonomy', filters?.sort);
  }, [filters, pageNumber]);

  const setFiletrsForApiCall = () => {
    let optionalFilters = new URLSearchParams();

    let sortParam;

    if (filters.sort == `${sortByOptionsTaxonomy[0].key}`) {
      sortParam = `${sortByOptionsTaxonomy[0].key}.${i18next.language}`;
    } else {
      sortParam = filters.sort;
    }
    optionalFilters.append('sort', encodeURIComponent(`${filters?.order}(${sortParam})`));

    const filtersDecoded = decodeURIComponent(decodeURIComponent(optionalFilters.toString()));
    return filtersDecoded;
  };

  //   handlers

  const onSearchChangeHandler = (event) => {
    if (event.target.value === '') setFilters({ ...filters, query: event.target.value });
  };

  const onSearchHandler = (event) => {
    setPageNumber(1);
    setFilters({ ...filters, query: event.target.value });
  };

  const handleSortOrderChange = () => {
    setPageNumber(1);
    filters?.order === sortOrder?.ASC
      ? setFilters({ ...filters, order: sortOrder?.DESC })
      : setFilters({ ...filters, order: sortOrder?.ASC });
  };

  const filterClearHandler = () => {
    setFilters({
      sort: `${sortByOptionsTaxonomy[0].key}`,
      order: sortOrder?.ASC,
      query: '',
    });
    setPageNumber(1);
    sessionStorage.removeItem('page');
    sessionStorage.removeItem('query');
    sessionStorage.removeItem('orderUserListing');
    sessionStorage.removeItem('sortByUserListing');
    sessionStorage.removeItem('userStatusUserListing');
    sessionStorage.removeItem('userRoleUserListing');
  };

  const onSortSelect = ({ selectedKeys }) => {
    setFilters({
      ...filters,
      sort: selectedKeys[0],
      order: sortOrder?.ASC,
    });
    setPageNumber(1);
  };

  const addTaxonomyHandler = () => {
    // navigate(`${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}${PathName.AddUser}`);
  };

  return (
    <FeatureFlag isFeatureEnabled={featureFlags.settingsScreenUsers}>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="taxonomy-listing-wrapper">
        <Col span={24}>
          <Row justify="space-between" align="top">
            <Col>
              <div className="events-heading-wrapper">
                <h4 className="events-heading">{t('dashboard.taxonomy.listing.heading')}</h4>
              </div>
            </Col>

            <Col flex={'140px'} className="add-btn-container">
              <ReadOnlyProtectedComponent creator={user?.id}>
                <AddEvent label={t('dashboard.taxonomy.listing.addNew')} onClick={addTaxonomyHandler} />
              </ReadOnlyProtectedComponent>
            </Col>
          </Row>
          <Row justify="space-between" gutter={[24, 16]} style={{ marginBottom: 16 }}>
            <Col flex={'auto'}>
              <Row gutter={[8, 8]} align="middle">
                <Col flex={'auto'} style={{ marginRight: '24px', maxWidth: 400 }}>
                  <UserSearch
                    placeholder={t('dashboard.settings.userManagement.searchPlaceholder')}
                    onPressEnter={(e) => onSearchHandler(e)}
                    defaultValue={filters.query}
                    allowClear={true}
                    onChange={onSearchChangeHandler}
                  />
                </Col>
                <Col>
                  <Row align="middle" className="sort-option-row">
                    <span style={{ fontSize: '16px', fontWeight: 700, marginRight: 8 }}>
                      {t('dashboard.settings.userManagement.sort')}
                    </span>

                    <Dropdown
                      overlayClassName="filter-sort-dropdown-wrapper"
                      overlayStyle={{ minWidth: '200px' }}
                      getPopupContainer={(trigger) => trigger.parentNode}
                      menu={{
                        items: sortByOptionsTaxonomy,
                        selectedKeys: [filters?.sort],
                        selectable: true,
                        onSelect: onSortSelect,
                      }}
                      trigger={['click']}>
                      <Button size="large" className="filter-sort-button">
                        <Space>
                          {sortByOptionsTaxonomy?.map((sortBy, index) => {
                            if (sortBy?.key === filters?.sort) return <span key={index}>{sortBy?.label}</span>;
                          })}
                          <DownOutlined style={{ fontSize: '12px', color: '#222732' }} />
                        </Space>
                      </Button>
                    </Dropdown>
                    <Button
                      className="filter-sort-button"
                      style={{ borderColor: filters?.order && '#1B3DE6' }}
                      onClick={handleSortOrderChange}
                      icon={
                        filters?.order === sortOrder?.ASC ? (
                          <SortAscendingOutlined style={{ color: '#1B3DE6', fontSize: '24px' }} />
                        ) : (
                          filters?.order === sortOrder?.DESC && (
                            <SortDescendingOutlined style={{ color: '#1B3DE6', fontSize: '24px' }} />
                          )
                        )
                      }
                      size={'large'}
                    />
                  </Row>
                </Col>
                <Col>
                  {(filters.order !== sortOrder.ASC || filters.sort !== `${sortByOptionsTaxonomy[0].key}`) && (
                    <Button
                      size="large"
                      className="filter-buttons"
                      style={{ color: '#1B3DE6' }}
                      onClick={filterClearHandler}>
                      {t('dashboard.events.filter.clear')}&nbsp;
                      <CloseCircleOutlined style={{ color: '#1B3DE6', fontSize: '16px' }} />
                    </Button>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        {!isTaxonomyFetching ? (
          <Col flex={'832px'}>
            <Row>
              <Col span={24}>
                {allTaxonomy?.data.length && !isTaxonomyFetching > 0 ? (
                  <List
                    className="event-list-wrapper"
                    itemLayout={screens.xs ? 'vertical' : 'horizontal'}
                    dataSource={allTaxonomy?.data}
                    bordered={false}
                    pagination={{
                      onChange: (page) => {
                        setPageNumber(page);
                        window.scrollTo({
                          top: 0,
                          left: 0,
                          behavior: 'smooth',
                        });
                      },
                      pageSize: 10,
                      hideOnSinglePage: true,
                      total: allTaxonomy?.count,
                      current: Number(pageNumber),
                      showSizeChanger: false,
                    }}
                    renderItem={(item, index) => <p>item{index}</p>}
                  />
                ) : (
                  <NoContent style={{ height: '200px' }} />
                )}
              </Col>
            </Row>
          </Col>
        ) : (
          <div
            style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoadingIndicator />
          </div>
        )}
      </Row>
    </FeatureFlag>
  );
};

export default Taxonomy;
