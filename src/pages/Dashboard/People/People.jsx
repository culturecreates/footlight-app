import React, { useRef, useState, useEffect } from 'react';
import './people.css';
import { List, Grid } from 'antd';
import { DeleteOutlined, UserOutlined } from '@ant-design/icons';
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
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import { userRoles } from '../../../constants/userRoles';
import { useDeletePersonMutation, useLazyGetAllPeopleQuery } from '../../../services/people';
import { sortByOptionsOrgsPlacesPerson, sortOrder } from '../../../constants/sortByOptions';
import i18n from 'i18next';
import { PathName } from '../../../constants/pathName';
import { Confirm } from '../../../components/Modal/Confirm/Confirm';
import { useLazyGetEntityDependencyCountQuery } from '../../../services/entities';

const { useBreakpoint } = Grid;

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

  const totalCount = allPeopleData?.count;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

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

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
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

  const filterClearHandler = () => {
    setFilter({
      sort: sortByOptionsOrgsPlacesPerson[0]?.key,
      order: sortOrder?.ASC,
    });
    setPageNumber(1);
    sessionStorage.removeItem('peoplePage');
    sessionStorage.removeItem('peopleSearchQuery');
    sessionStorage.removeItem('peopleOrder');
    sessionStorage.removeItem('peopleSortBy');
  };

  useEffect(() => {
    let sortQuery = new URLSearchParams();
    sortQuery.append(
      'sort',
      encodeURIComponent(
        `${filter?.order}(${filter?.sort}${
          filter?.sort === sortByOptionsOrgsPlacesPerson[0]?.key ? '.' + i18n.language : ''
        })`,
      ),
    );
    getAllPeople({
      calendarId,
      sessionId: timestampRef,
      pageNumber,
      query: peopleSearchQuery,
      sort: sortQuery,
    });
    let params = {
      page: pageNumber,
      order: filter?.order,
      sortBy: filter?.sort,
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
  }, [pageNumber, peopleSearchQuery, filter]);
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
            <></>
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
                        logo={item?.image?.thumbnail?.uri}
                        defaultLogo={
                          <UserOutlined style={{ color: '#607EFC', fontSize: '18px' }} data-cy="logo-person" />
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
                <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
