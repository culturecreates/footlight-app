import React, { useRef, useState, useEffect } from 'react';
import './people.css';
import { List, Grid, Space, Row, Col, Badge, Button, Popover, Tree } from 'antd';
import { DeleteOutlined, UserOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import Main from '../../../layout/Main/Main';
import PersonSearch from '../../../components/Search/Events/EventsSearch';
import AddPerson from '../../../components/Button/AddEvent';
import Sort from '../../../components/Sort/Sort';
import NoContent from '../../../components/NoContent/NoContent';
import ListItem from '../../../components/List/ListItem.jsx/ListItem';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
  createSearchParams,
} from 'react-router-dom';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import { useDeletePersonMutation, useLazyGetAllPeopleQuery } from '../../../services/people';
import { sortByOptionsOrgsPlacesPerson, sortOrder } from '../../../constants/sortByOptions';
import i18n from 'i18next';
import { PathName } from '../../../constants/pathName';
import { Confirm } from '../../../components/Modal/Confirm/Confirm';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { treeTaxonomyOptions } from '../../../components/TreeSelectOption/treeSelectOption.settings';
import { useLazyGetEntityDependencyCountQuery } from '../../../services/entities';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';

const { useBreakpoint } = Grid;
const standardTaxonomyMaps = [
  {
    mappedToField: 'Occupation',
    queryKey: 'occupationIds',
  },
];

function People() {
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

  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.PERSON);
  const { currentData: allTaxonomyData } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
    addToFilter: true,
  });
  const [getAllPeople, { currentData: allPeopleData, isFetching: allPeopleFetching, isSuccess: allPeopleSuccess }] =
    useLazyGetAllPeopleQuery();
  const [deletePerson] = useDeletePersonMutation();
  const [getDependencyDetails, { isFetching: dependencyDetailsFetching }] = useLazyGetEntityDependencyCountQuery();

  const [pageNumber, setPageNumber] = useState(
    searchParams.get('page') ? searchParams.get('page') : sessionStorage.getItem('peoplePage') ?? 1,
  );
  const [peopleSearchQuery, setPeopleSearchQuery] = useState(
    searchParams.get('query') ? searchParams.get('query') : sessionStorage.getItem('peopleSearchQuery') ?? '',
  );
  const [filter, setFilter] = useState({
    sort: searchParams.get('sortBy')
      ? searchParams.get('sortBy')
      : sessionStorage.getItem('peopleSortBy') ?? sortByOptionsOrgsPlacesPerson[0]?.key,
    order: searchParams.get('order')
      ? searchParams.get('order')
      : sessionStorage.getItem('peopleOrder') ?? sortOrder?.ASC,
  });
  const [taxonomyFilter, setTaxonomyFilter] = useState(
    searchParams.get('taxonomyFilter')
      ? JSON.parse(searchParams.get('taxonomyFilter'))
      : sessionStorage.getItem('peopleTaxonomyFilter')
      ? JSON.parse(sessionStorage.getItem('peopleTaxonomyFilter'))
      : {},
  );

  const [standardTaxonomyFilter, setStandardTaxonomyFilter] = useState(
    searchParams.get('standardTaxonomyFilter')
      ? JSON.parse(searchParams.get('standardTaxonomyFilter'))
      : sessionStorage.getItem('standardPeopleTaxonomyFilter')
      ? JSON.parse(sessionStorage.getItem('standardPeopleTaxonomyFilter'))
      : {},
  );

  const totalCount = allPeopleData?.count;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  let customFilters = currentCalendarData?.filterPersonalization?.customFields;

  const deletePersonHandler = (personId) => {
    getDependencyDetails({ ids: personId, calendarId })
      .unwrap()
      .then((res) => {
        Confirm({
          title: t('dashboard.people.deletePerson.title'),
          content: `${t('dashboard.people.deletePerson.description')} ${t('dashboard.people.deletePerson.impact')}${t(
            'dashboard.people.deletePerson.published',
            { number: `${res?.events?.publishedEventCount}` },
          )}, ${t('dashboard.people.deletePerson.draft', {
            number: `${res?.events?.draftEventCount}`,
          })}, ${t('dashboard.people.deletePerson.inReview', { number: `${res?.events?.pendingEventCount}` })}.`,
          okText: t('dashboard.people.deletePerson.ok'),
          cancelText: t('dashboard.people.deletePerson.cancel'),
          className: 'delete-modal-container',
          onAction: () => {
            deletePerson({ id: personId, calendarId: calendarId });
          },
        });
      });
  };

  const listItemHandler = (id) => {
    navigate(`${location.pathname}/${id}`);
  };

  const onSearchHandler = (event) => {
    setPageNumber(1);
    setPeopleSearchQuery(event.target.value);
  };
  const onChangeHandler = (event) => {
    if (event.target.value === '') setPeopleSearchQuery('');
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
    sessionStorage.removeItem('peoplePage');
    sessionStorage.removeItem('peopleSearchQuery');
    sessionStorage.removeItem('peopleOrder');
    sessionStorage.removeItem('peopleTaxonomyFilter');
    sessionStorage.removeItem('standardPeopleTaxonomyFilter');
    sessionStorage.removeItem('peopleSortBy');
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
    getAllPeople({
      calendarId,
      sessionId: timestampRef,
      pageNumber,
      query: peopleSearchQuery,
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
    if (peopleSearchQuery && peopleSearchQuery !== '')
      params = {
        ...params,
        query: peopleSearchQuery,
      };
    setSearchParams(createSearchParams(params));
    sessionStorage.setItem('peoplePage', pageNumber);
    sessionStorage.setItem('peopleSearchQuery', peopleSearchQuery);
    sessionStorage.setItem('peopleOrder', filter?.order);
    sessionStorage.setItem('peopleSortBy', filter?.sort);
    if (Object.keys(taxonomyFilter)?.length > 0)
      sessionStorage.setItem('peopleTaxonomyFilter', JSON.stringify(taxonomyFilter));
    else sessionStorage.removeItem('peopleTaxonomyFilter');
    if (Object.keys(standardTaxonomyFilter)?.length > 0)
      sessionStorage.setItem('standardPeopleTaxonomyFilter', JSON.stringify(standardTaxonomyFilter));
    else sessionStorage.removeItem('standardPeopleTaxonomyFilter');
  }, [pageNumber, peopleSearchQuery, filter, taxonomyFilter, standardTaxonomyFilter]);

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
          <LoadingIndicator data-cy="loading-indicator-people-confirm" />
        </div>
      )}
      {allPeopleSuccess && currentCalendarData ? (
        <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
          <Main>
            <h4 className="events-heading" data-cy="heading-people-title">
              {t('dashboard.people.people')}
            </h4>
            <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
              <AddPerson
                disabled={isReadOnly ? true : false}
                label={t('dashboard.people.person')}
                onClick={() => {
                  navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.Search}`);
                }}
                data-cy="button-add-new-person"
              />
            </FeatureFlag>
            <PersonSearch
              placeholder={t('dashboard.people.search.placeholder')}
              onPressEnter={(e) => onSearchHandler(e)}
              defaultValue={peopleSearchQuery}
              allowClear={true}
              onChange={onChangeHandler}
              data-cy="input-person-search"
            />
            <Sort
              filter={filter}
              setFilter={setFilter}
              setPageNumber={setPageNumber}
              filterClearHandler={filterClearHandler}
            />
            <Space>
              {allTaxonomyData?.data?.length > 0 &&
                adminCheckHandler({ user, calendar }) &&
                allTaxonomyData?.data?.map((taxonomy, index) => {
                  if (!taxonomy?.isDynamicField && customFilters?.includes(taxonomy?.id))
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
                            data-cy="button-filter-taxonomy-standard-people">
                            {bilingual({
                              data: taxonomy?.name,
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
                adminCheckHandler({ user, calendar }) &&
                allTaxonomyData?.data?.map((taxonomy, index) => {
                  if (taxonomy?.isDynamicField === true && customFilters?.includes(taxonomy?.id))
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
                            data-cy="button-filter-taxonomy-people">
                            {bilingual({
                              data: taxonomy?.name,
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
                  Object.keys(standardTaxonomyFilter)?.length > 0 ||
                  filter?.sort != sortByOptionsOrgsPlacesPerson[0]?.key) && (
                  <Button
                    size="large"
                    className="filter-buttons"
                    style={{ color: '#1B3DE6' }}
                    onClick={filterClearHandler}
                    data-cy="button-filter-clear-people">
                    {t('dashboard.events.filter.clear')}&nbsp;
                    <CloseCircleOutlined style={{ color: '#1B3DE6', fontSize: '16px' }} />
                  </Button>
                )}
              </Col>
            </Space>
            <div className="responsvie-list-wrapper-class">
              {!allPeopleFetching ? (
                allPeopleData?.data?.length > 0 ? (
                  <List
                    data-cy="list-people"
                    itemLayout={!screens.sm ? 'vertical' : 'horizontal'}
                    dataSource={allPeopleData?.data}
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
                        data-cy="list-item-person"
                        key={index}
                        id={index}
                        logo={item?.image?.find((image) => image?.isMain)?.thumbnail?.uri}
                        defaultLogo={
                          <UserOutlined style={{ color: '#607EFC', fontSize: '18px' }} data-cy="logo-person" />
                        }
                        title={contentLanguageBilingual({
                          data: item?.name,
                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                          calendarContentLanguage: calendarContentLanguage,
                        })}
                        description={contentLanguageBilingual({
                          data: item?.disambiguatingDescription,
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
                          adminCheckHandler({ calendar, user }) && !isReadOnly && (
                            <DeleteOutlined
                              data-cy="icon-delete-person"
                              key={'delete-icon'}
                              style={{ color: '#222732', fontSize: '24px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePersonHandler(item?.id);
                              }}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LoadingIndicator data-cy="loading-indicator-people" />
                </div>
              )}
            </div>
          </Main>
        </FeatureFlag>
      ) : (
        <div className="loader-grid">
          <LoadingIndicator />
        </div>
      )}
    </>
  );
}

export default People;
