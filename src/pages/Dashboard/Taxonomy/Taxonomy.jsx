import { Badge, Button, Checkbox, Col, Dropdown, Grid, List, Row, Space } from 'antd';
import i18next from 'i18next';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { createSearchParams, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NoContent from '../../../components/NoContent/NoContent';
import { sortByOptionsTaxonomy, sortOrder } from '../../../constants/sortByOptions';
import ReadOnlyProtectedComponent from '../../../layout/ReadOnlyProtectedComponent';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useDeleteTaxonomyMutation, useLazyGetAllTaxonomyQuery } from '../../../services/taxonomy';
import UserSearch from '../../../components/Search/Events/EventsSearch';
import { PathName } from '../../../constants/pathName';
import AddEvent from '../../../components/Button/AddEvent';
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
  DownOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  TagOutlined,
} from '@ant-design/icons';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import './taxonomy.css';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import ListItem from '../../../components/List/ListItem.jsx/ListItem';
import { userRoles } from '../../../constants/userRoles';
import { Confirm } from '../../../components/Modal/Confirm/Confirm';
import { taxonomyClassTranslations } from '../../../constants/taxonomyClass';
import SearchableCheckbox from '../../../components/Filter/SearchableCheckbox/SearchableCheckbox';

const Taxonomy = () => {
  const { useBreakpoint } = Grid;

  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  let [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector(getUserDetails);
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const [currentCalendarData, , , getCalendar] = useOutletContext();
  const navigate = useNavigate();

  const [getAllTaxonomy, { currentData: allTaxonomy, isFetching: isTaxonomyFetching }] = useLazyGetAllTaxonomyQuery({
    sessionId: timestampRef,
  });
  const [deleteTaxonomy] = useDeleteTaxonomyMutation();

  const sortByParam = searchParams.get('sortBy');

  const orderParam = searchParams.get('order');
  const queryParam = searchParams.get('query');
  const classParam = searchParams.get('class');

  const totalCount = allTaxonomy?.totalCount;
  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  const defaultSort = sortByParam || sessionStorage.getItem('sortByTaxonomy') || `${sortByOptionsTaxonomy[0].key}`;
  const defaultOrder = orderParam || sessionStorage.getItem('orderTaxonomy') || sortOrder?.ASC;
  const defaultQuery = queryParam || sessionStorage.getItem('queryTaxonomy') || '';
  const defaultClass = classParam || sessionStorage.getItem('classTaxonomy') || [];

  const [filters, setFilters] = useState({
    sort: decodeURIComponent(defaultSort),
    order: decodeURIComponent(defaultOrder),
    query: decodeURIComponent(defaultQuery),
    class: decodeURIComponent(defaultClass)?.split(','),
  });
  const [pageNumber, setPageNumber] = useState(1);

  const handleListCardStyles = () => {
    const listCardStyles = !adminCheckHandler() ? { style: { cursor: 'initial' } } : { style: { cursor: 'pointer' } };
    return listCardStyles;
  };

  useEffect(() => {
    const filtersDecoded = setFiletrsForApiCall();

    getAllTaxonomy({
      calendarId,
      query: filters.query,
      filters: filtersDecoded,
      taxonomyClass: '',
      includeConcepts: false,
      page: pageNumber,
      limit: 10,
    });

    let params = {
      page: pageNumber,
      order: filters?.order,
      sortBy: filters?.sort,
      ...(filters.query !== '' && { query: filters.query }),
      ...(filters?.class?.length > 0 && filters?.class[0] !== '' && { class: encodeURIComponent(filters?.class) }),
    };
    setSearchParams(createSearchParams(params));
    sessionStorage.setItem('pageTaxonomy', pageNumber);

    sessionStorage.setItem('queryTaxonomy', filters.query);
    sessionStorage.setItem('orderTaxonomy', filters?.order);
    sessionStorage.setItem('sortByTaxonomy', filters?.sort);
    filters?.class?.length > 0 && sessionStorage.setItem('classTaxonomy', encodeURIComponent(filters?.class));
  }, [filters, pageNumber]);

  const setFiletrsForApiCall = () => {
    let optionalFilters = new URLSearchParams();

    let sortParam;

    filters?.class?.length > 0 &&
      filters?.class[0] !== '' &&
      filters?.class?.forEach((c) => {
        optionalFilters.append('taxonomy-class', c.toUpperCase());
      });

    if (filters.sort == `${sortByOptionsTaxonomy[0].key}`) {
      sortParam = `${sortByOptionsTaxonomy[0].key}.${i18next.language}`;
    } else {
      sortParam = filters.sort;
    }
    optionalFilters.append('sort', encodeURIComponent(`${filters?.order}(${sortParam})`));

    const filtersDecoded = decodeURIComponent(optionalFilters.toString());
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
    sessionStorage.removeItem('queryTaxonomy');
    sessionStorage.removeItem('orderUserListing');
    sessionStorage.removeItem('orderTaxonomy');
    sessionStorage.removeItem('classTaxonomy');
  };

  const classFilterChangeHandler = (values) => {
    setFilters({ ...filters, class: values });
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
    navigate(`${PathName.Dashboard}/${calendarId}${PathName.Taxonomies}${PathName.AddTaxonomySelectType}`);
  };
  const listItemHandler = (id) => {
    adminCheckHandler() &&
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Taxonomies}${PathName.AddTaxonomy}?id=${id}`);
  };
  const deleteOrganizationHandler = (id) => {
    Confirm({
      title: t('dashboard.taxonomy.listing.modal.titleDelete'),
      onAction: () => {
        deleteTaxonomy({ id: id, calendarId: calendarId })
          .unwrap()
          .then((res) => {
            if (res.statusCode == 202) {
              getCalendar({ id: calendarId, sessionId: timestampRef });
            }
          });
      },
      okText: t('dashboard.settings.addUser.delete'),
      cancelText: t('dashboard.settings.addUser.cancel'),
      content: t('dashboard.taxonomy.listing.modal.contentDelete'),
    });
  };

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
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

            {adminCheckHandler() && (
              <Col flex={'140px'} className="add-btn-container">
                <ReadOnlyProtectedComponent creator={user?.id}>
                  <AddEvent label={t('dashboard.taxonomy.listing.addNew')} onClick={addTaxonomyHandler} />
                </ReadOnlyProtectedComponent>
              </Col>
            )}
          </Row>
          <Row justify="space-between" gutter={[24, 16]} style={{ marginBottom: 16 }}>
            <Col flex={'auto'}>
              <Row gutter={[8, 8]} align="middle">
                <Col flex={'auto'} style={{ marginRight: '24px', maxWidth: 400 }}>
                  <UserSearch
                    placeholder={t('dashboard.taxonomy.listing.search')}
                    onPressEnter={(e) => onSearchHandler(e)}
                    defaultValue={filters.query}
                    allowClear={true}
                    onChange={onSearchChangeHandler}
                  />
                </Col>
                <Col>
                  <Row align="middle" className="sort-option-row" gutter={8}>
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
              </Row>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col>
              <SearchableCheckbox
                overlayClassName="filter-sort-dropdown-wrapper"
                getPopupContainer={(trigger) => trigger.parentNode}
                overlayStyle={{ minWidth: '200px' }}
                onFilterChange={classFilterChangeHandler}
                data={taxonomyClassTranslations?.map((classType) => {
                  return {
                    key: classType.key,
                    label: (
                      <Checkbox value={classType.key} key={classType.key} style={{ marginLeft: '8px' }}>
                        {classType.label}
                      </Checkbox>
                    ),
                    filtervalue: classType.key,
                  };
                })}
                allowSearch={false}
                value={filters?.class}
                trigger={['click']}>
                <Button
                  size="large"
                  className="filter-buttons"
                  style={{ borderColor: filters?.class?.length > 0 && filters?.class[0] !== '' && '#607EFC' }}>
                  {t('dashboard.taxonomy.listing.classType')}
                  {filters?.class?.length > 0 && (
                    <>
                      &nbsp;
                      <Badge
                        count={filters?.class?.length > 0 && filters?.class[0] !== '' ? filters?.class?.length : <></>}
                        showZero={false}
                        color="#1B3DE6"
                      />
                    </>
                  )}
                </Button>
              </SearchableCheckbox>
            </Col>
            <Col>
              {(filters.order !== sortOrder.ASC ||
                filters.sort !== `${sortByOptionsTaxonomy[0].key}` ||
                (filters?.class?.length > 0 && filters?.class[0] !== '')) && (
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
        {!isTaxonomyFetching ? (
          <Col flex={'832px'}>
            <Row>
              <Col span={24}>
                {allTaxonomy?.data.length && !isTaxonomyFetching > 0 ? (
                  <List
                    className={`event-list-wrapper ${adminCheckHandler() ? '' : 'non-admin-class'}`}
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
                      total: totalCount,
                      current: Number(pageNumber),
                      showSizeChanger: false,
                    }}
                    renderItem={(item, index) => (
                      <ListItem
                        key={index}
                        id={index}
                        styles={handleListCardStyles()}
                        logo={item?.logo?.thumbnail?.uri}
                        defaultLogo={<TagOutlined style={{ color: '#607EFC', fontSize: '18px' }} />}
                        title={contentLanguageBilingual({
                          en: item?.name?.en,
                          fr: item?.name?.fr,
                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                          calendarContentLanguage: calendarContentLanguage,
                        })}
                        description={contentLanguageBilingual({
                          en: item?.disambiguatingDescription?.en,
                          fr: item?.disambiguatingDescription?.fr,
                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                          calendarContentLanguage: calendarContentLanguage,
                        })}
                        createdDate={item?.creator?.date}
                        createdByUserName={item?.creator?.userName}
                        updatedDate={item?.modifier?.date}
                        updatedByUserName={item?.modifier?.userName}
                        listItemHandler={() => listItemHandler(item?.id)}
                        actions={[
                          adminCheckHandler() && (
                            <DeleteOutlined
                              key={'delete-icon'}
                              style={{ color: '#222732', fontSize: '24px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteOrganizationHandler(item?.id);
                              }}
                            />
                          ),
                        ]}
                      />
                    )}
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
