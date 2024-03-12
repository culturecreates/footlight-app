import React, { useRef, useState, useEffect } from 'react';
import './places.css';
import { List, Grid, Popover, Col, Button, Row, Tree, Badge, Space } from 'antd';
import { DeleteOutlined, EnvironmentOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import Main from '../../../layout/Main/Main';
import PlaceSearch from '../../../components/Search/Events/EventsSearch';
import AddPlace from '../../../components/Button/AddEvent';
import Sort from '../../../components/Sort/Sort';
import NoContent from '../../../components/NoContent/NoContent';
import ListItem from '../../../components/List/ListItem.jsx/ListItem';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
  createSearchParams,
  useSearchParams,
} from 'react-router-dom';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import { userRoles } from '../../../constants/userRoles';
import { useDeletePlacesMutation, useLazyGetAllPlacesQuery } from '../../../services/places';
import { sortByOptionsOrgsPlacesPerson, sortOrder } from '../../../constants/sortByOptions';
import i18n from 'i18next';
import { PathName } from '../../../constants/pathName';
import { Confirm } from '../../../components/Modal/Confirm/Confirm';
import { useLazyGetEntityDependencyQuery } from '../../../services/entities';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { treeTaxonomyOptions } from '../../../components/TreeSelectOption/treeSelectOption.settings';

const { useBreakpoint } = Grid;
const standardTaxonomyMaps = [
  {
    mappedToField: 'Type',
    queryKey: 'type',
  },
  {
    mappedToField: 'PlaceAccessibility',
    queryKey: 'accessibility',
  },
  {
    mappedToField: 'Region',
    queryKey: 'region',
  },
];

function Places() {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId } = useParams();
  let [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector(getUserDetails);
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
    isReadOnly,
  ] = useOutletContext();
  setContentBackgroundColor('#fff');

  const { currentData: allTaxonomyData } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.PLACE,
    includeConcepts: true,
    sessionId: timestampRef,
    addToFilter: false,
  });
  const [getAllPlaces, { currentData: allPlacesData, isFetching: allPlacesFetching, isSuccess: allPlacesSuccess }] =
    useLazyGetAllPlacesQuery();
  const [deletePlaces] = useDeletePlacesMutation();
  const [getDependencyDetails, { isFetching: dependencyDetailsFetching }] = useLazyGetEntityDependencyQuery();

  const [pageNumber, setPageNumber] = useState(
    searchParams.get('page') ? searchParams.get('page') : sessionStorage.getItem('placesPage') ?? 1,
  );
  const [placesSearchQuery, setPlacesSearchQuery] = useState(
    searchParams.get('query') ? searchParams.get('query') : sessionStorage.getItem('placesSearchQuery') ?? '',
  );
  const [filter, setFilter] = useState({
    sort: sortByOptionsOrgsPlacesPerson[0]?.key,
    order: searchParams.get('order')
      ? searchParams.get('order')
      : sessionStorage.getItem('placeOrder') ?? sortOrder?.ASC,
  });

  const [taxonomyFilter, setTaxonomyFilter] = useState(
    searchParams.get('taxonomyFilter')
      ? JSON.parse(searchParams.get('taxonomyFilter'))
      : sessionStorage.getItem('placeTaxonomyFilter')
      ? JSON.parse(sessionStorage.getItem('placeTaxonomyFilter'))
      : {},
  );

  const [standardTaxonomyFilter, setStandardTaxonomyFilter] = useState(
    searchParams.get('standardTaxonomyFilter')
      ? JSON.parse(searchParams.get('standardTaxonomyFilter'))
      : sessionStorage.getItem('standardPlaceTaxonomyFilter')
      ? JSON.parse(sessionStorage.getItem('standardPlaceTaxonomyFilter'))
      : {},
  );

  const totalCount = allPlacesData?.count;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  const deletePlaceHandler = (placeId) => {
    getDependencyDetails({ ids: placeId, calendarId })
      .unwrap()
      .then((res) => {
        Confirm({
          title: t('dashboard.places.deletePlace.title'),
          content: `${t('dashboard.places.deletePlace.description')} ${t('dashboard.places.deletePlace.impact')}  ${t(
            'dashboard.places.deletePlace.published',
            { number: `${res?.events?.publishedEventsCount}` },
          )},  ${t('dashboard.places.deletePlace.draft', { number: `${res?.events?.draftEventsCount}` })}, ${t(
            'dashboard.places.deletePlace.inReview',
            { number: `${res?.events?.pendingReviewEventsCount}` },
          )}.`,
          okText: t('dashboard.places.deletePlace.ok'),
          cancelText: t('dashboard.places.deletePlace.cancel'),
          className: 'delete-modal-container',
          onAction: () => {
            deletePlaces({ id: placeId, calendarId: calendarId });
          },
        });
      });
  };

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };

  const listItemHandler = (id) => {
    navigate(`${location.pathname}/${id}`);
  };

  const onSearchHandler = (event) => {
    setPageNumber(1);
    setPlacesSearchQuery(event.target.value);
  };

  const onChangeHandler = (event) => {
    if (event.target.value === '') setPlacesSearchQuery('');
  };

  const onCheck = ({ checkedKeys, taxonomy }) => {
    if (checkedKeys?.length === 0) {
      // eslint-disable-next-line no-unused-vars
      const { [taxonomy]: removedKey, ...updatedFilter } = taxonomyFilter;
      setTaxonomyFilter(updatedFilter);
    } else setTaxonomyFilter({ ...taxonomyFilter, [taxonomy]: checkedKeys });
  };

  const onStandardTaxonomyCheck = ({ checkedKeys, taxonomy }) => {
    if (checkedKeys?.length === 0) {
      // eslint-disable-next-line no-unused-vars
      const { [taxonomy]: removedKey, ...updatedFilter } = standardTaxonomyFilter;
      setStandardTaxonomyFilter(updatedFilter);
    } else setStandardTaxonomyFilter({ ...standardTaxonomyFilter, [taxonomy]: checkedKeys });
  };

  const filterClearHandler = () => {
    setFilter({
      sort: sortByOptionsOrgsPlacesPerson[0]?.key,
      order: sortOrder?.ASC,
    });
    setTaxonomyFilter({});
    setStandardTaxonomyFilter({});
    setPageNumber(1);
    sessionStorage.removeItem('placesPage');
    sessionStorage.removeItem('placesSearchQuery');
    sessionStorage.removeItem('placeOrder');
    sessionStorage.removeItem('taxonomyFilter');
    sessionStorage.removeItem('standardTaxonomyFilter');
  };

  useEffect(() => {
    let sortQuery = new URLSearchParams();
    let query = new URLSearchParams();
    sortQuery.append(
      'sort',
      encodeURIComponent(
        `${filter?.order}(${filter?.sort}${
          filter?.sort === sortByOptionsOrgsPlacesPerson[0]?.key ? '.' + i18n.language : ''
        })`,
      ),
    );
    Object.keys(taxonomyFilter)?.forEach((taxonomy) => {
      if (taxonomyFilter[taxonomy]?.length > 0) {
        taxonomyFilter[taxonomy]?.forEach((concept) => query.append('concept', concept));
      }
    });

    Object.keys(standardTaxonomyFilter)?.forEach((taxonomy) => {
      if (standardTaxonomyFilter[taxonomy]?.length > 0) {
        standardTaxonomyFilter[taxonomy]?.forEach((concept) => {
          standardTaxonomyMaps?.forEach((map) => {
            if (map.mappedToField === taxonomy) query.append(map.queryKey, concept);
          });
        });
      }
    });
    getAllPlaces({
      calendarId,
      sessionId: timestampRef,
      pageNumber,
      query: placesSearchQuery,
      sort: sortQuery,
      filterKeys: query,
    });
    let params = {
      page: pageNumber,
      order: filter?.order,
      sortBy: filter?.sort,
      ...(Object.keys(taxonomyFilter)?.length > 0 && { taxonomyFilter: JSON.stringify(taxonomyFilter) }),
      ...(Object.keys(standardTaxonomyFilter)?.length > 0 && {
        standardTaxonomyFilter: JSON.stringify(standardTaxonomyFilter),
      }),
    };
    if (placesSearchQuery && placesSearchQuery !== '')
      params = {
        ...params,
        query: placesSearchQuery,
      };
    setSearchParams(createSearchParams(params));
    sessionStorage.setItem('placesPage', pageNumber);
    sessionStorage.setItem('placesSearchQuery', placesSearchQuery);
    sessionStorage.setItem('placeOrder', filter?.order);
    if (Object.keys(taxonomyFilter)?.length > 0)
      sessionStorage.setItem('placeTaxonomyFilter', JSON.stringify(taxonomyFilter));
    else sessionStorage.removeItem('placeTaxonomyFilter');
    if (Object.keys(standardTaxonomyFilter)?.length > 0)
      sessionStorage.setItem('standardPlaceTaxonomyFilter', JSON.stringify(standardTaxonomyFilter));
    else sessionStorage.removeItem('standardPlaceTaxonomyFilter');
  }, [pageNumber, placesSearchQuery, filter, taxonomyFilter, standardTaxonomyFilter]);
  return (
    <>
      {dependencyDetailsFetching && (
        <div
          style={{
            height: 'calc(100% - 36px)',
            width: 'calc(100% - 32px)',
            position: 'absolute',
            display: 'flex',
            background: 'rgb(252 252 255 / 46%)',
            zIndex: 100,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <LoadingIndicator data-cy="loading-indicator-taxonomy-confirm" />
        </div>
      )}
      {allPlacesSuccess && (
        <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
          <Main>
            <h4 className="events-heading" data-cy="heading-place-title">
              {t('dashboard.places.places')}
            </h4>
            <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
              <AddPlace
                label={t('dashboard.places.place')}
                disabled={isReadOnly ? true : false}
                onClick={() => {
                  navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.Search}`);
                }}
                data-cy="button-add-new-place"
              />
            </FeatureFlag>

            <PlaceSearch
              placeholder={t('dashboard.places.search.placeholder')}
              onPressEnter={(e) => onSearchHandler(e)}
              defaultValue={placesSearchQuery}
              allowClear={true}
              onChange={onChangeHandler}
              data-cy="input-place-search"
            />
            <Sort filter={filter} setFilter={setFilter} setPageNumber={setPageNumber} />
            <Space>
              {allTaxonomyData?.data?.length > 0 &&
                allTaxonomyData?.data?.map((taxonomy, index) => {
                  if (!taxonomy?.isDynamicField)
                    return (
                      <Col key={index}>
                        <Popover
                          placement="bottom"
                          getPopupContainer={(trigger) => trigger.parentNode}
                          content={
                            <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
                              <Col span={24}>
                                <div style={{ padding: '8px', maxHeight: '300px', overflowY: 'scroll' }}>
                                  <Tree
                                    checkable
                                    autoExpandParent={true}
                                    onCheck={(checkedKeys, { checked, checkedNodes, node, event, halfCheckedKeys }) =>
                                      onStandardTaxonomyCheck({
                                        checkedKeys,
                                        checked,
                                        checkedNodes,
                                        node,
                                        event,
                                        halfCheckedKeys,
                                        taxonomy: taxonomy?.mappedToField,
                                      })
                                    }
                                    checkedKeys={standardTaxonomyFilter[taxonomy?.mappedToField] ?? []}
                                    treeData={treeTaxonomyOptions(
                                      allTaxonomyData,
                                      user,
                                      taxonomy?.mappedToField,
                                      false,
                                      calendarContentLanguage,
                                    )}
                                  />
                                </div>
                              </Col>
                            </Row>
                          }
                          trigger="click"
                          overlayClassName="date-filter-popover">
                          <Button
                            size="large"
                            className="filter-buttons"
                            style={{
                              borderColor: standardTaxonomyFilter[taxonomy?.mappedToField]?.length > 0 > 0 && '#607EFC',
                            }}
                            data-cy="button-filter-dates">
                            {bilingual({
                              en: taxonomy?.name?.en,
                              fr: taxonomy?.name?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            })}
                            {standardTaxonomyFilter[taxonomy?.mappedToField]?.length > 0 && (
                              <>
                                &nbsp; <Badge color="#1B3DE6" />
                              </>
                            )}
                          </Button>
                        </Popover>
                      </Col>
                    );
                })}
              {allTaxonomyData?.data?.length > 0 &&
                allTaxonomyData?.data?.map((taxonomy, index) => {
                  if (taxonomy?.isDynamicField === true)
                    return (
                      <Col key={index}>
                        <Popover
                          placement="bottom"
                          getPopupContainer={(trigger) => trigger.parentNode}
                          content={
                            <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
                              <Col span={24}>
                                <div style={{ padding: '8px', maxHeight: '300px', overflowY: 'scroll' }}>
                                  <Tree
                                    checkable
                                    autoExpandParent={true}
                                    onCheck={(checkedKeys, { checked, checkedNodes, node, event, halfCheckedKeys }) =>
                                      onCheck({
                                        checkedKeys,
                                        checked,
                                        checkedNodes,
                                        node,
                                        event,
                                        halfCheckedKeys,
                                        taxonomy: taxonomy?.id,
                                      })
                                    }
                                    checkedKeys={taxonomyFilter[taxonomy?.id] ?? []}
                                    treeData={treeTaxonomyOptions(
                                      allTaxonomyData,
                                      user,
                                      taxonomy?.mappedToField,
                                      true,
                                      calendarContentLanguage,
                                    )}
                                  />
                                </div>
                              </Col>
                            </Row>
                          }
                          trigger="click"
                          overlayClassName="date-filter-popover">
                          <Button
                            size="large"
                            className="filter-buttons"
                            style={{ borderColor: taxonomyFilter[taxonomy?.id]?.length > 0 > 0 && '#607EFC' }}
                            data-cy="button-filter-dates">
                            {bilingual({
                              en: taxonomy?.name?.en,
                              fr: taxonomy?.name?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            })}
                            {taxonomyFilter[taxonomy?.id]?.length > 0 && (
                              <>
                                &nbsp; <Badge color="#1B3DE6" />
                              </>
                            )}
                          </Button>
                        </Popover>
                      </Col>
                    );
                })}
              <Col>
                {(filter?.order === sortOrder?.DESC ||
                  Object.keys(taxonomyFilter)?.length > 0 ||
                  Object.keys(standardTaxonomyFilter)?.length > 0) && (
                  <Button
                    size="large"
                    className="filter-buttons"
                    style={{ color: '#1B3DE6' }}
                    onClick={filterClearHandler}
                    data-cy="button-filter-clear">
                    {t('dashboard.events.filter.clear')}&nbsp;
                    <CloseCircleOutlined style={{ color: '#1B3DE6', fontSize: '16px' }} />
                  </Button>
                )}
              </Col>
            </Space>

            <div className="responsvie-list-wrapper-class">
              {!allPlacesFetching ? (
                allPlacesData?.data?.length > 0 ? (
                  <List
                    data-cy="list-places"
                    // className="event-list-wrapper"
                    itemLayout={screens.xs ? 'vertical' : 'horizontal'}
                    dataSource={allPlacesData?.data}
                    bordered={false}
                    pagination={{
                      onChange: (page) => {
                        setPageNumber(page);
                      },
                      pageSize: 10,
                      hideOnSinglePage: true,
                      total: totalCount,
                      current: Number(pageNumber),
                      showSizeChanger: false,
                    }}
                    renderItem={(item, index) => (
                      <ListItem
                        data-cy="list-item-place"
                        key={index}
                        id={index}
                        logo={item?.logo?.thumbnail?.uri}
                        defaultLogo={
                          <EnvironmentOutlined style={{ color: '#607EFC', fontSize: '18px' }} data-cy="logo-place" />
                        }
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
                        artsDataLink={artsDataLinkChecker(item?.sameAs)}
                        listItemHandler={() => listItemHandler(item?.id)}
                        actions={[
                          adminCheckHandler() && !isReadOnly && (
                            <DeleteOutlined
                              data-cy="icon-delete-place"
                              key={'delete-icon'}
                              style={{ color: '#222732', fontSize: '24px' }}
                              onClick={() => deletePlaceHandler(item?.id)}
                            />
                          ),
                        ]}
                      />
                    )}
                  />
                ) : (
                  <NoContent style={{ height: '200px' }} />
                )
              ) : (
                <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LoadingIndicator data-cy="loading-indicator-place" />
                </div>
              )}
            </div>
          </Main>
        </FeatureFlag>
      )}
    </>
  );
}

export default Places;
