import React, { useRef, useState, useEffect } from 'react';
import './places.css';
import { List, Grid } from 'antd';
import { DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
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
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import { userRoles } from '../../../constants/userRoles';
import { useDeletePlacesMutation, useLazyGetAllPlacesQuery } from '../../../services/places';
import { sortByOptionsOrgsPlacesPerson, sortOrder } from '../../../constants/sortByOptions';
import i18n from 'i18next';
import { PathName } from '../../../constants/pathName';
import { Confirm } from '../../../components/Modal/Confirm/Confirm';
import { useLazyGetEntityDependencyCountQuery } from '../../../services/entities';

const { useBreakpoint } = Grid;

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

  const [getAllPlaces, { currentData: allPlacesData, isFetching: allPlacesFetching, isSuccess: allPlacesSuccess }] =
    useLazyGetAllPlacesQuery();
  const [deletePlaces] = useDeletePlacesMutation();
  const [getDependencyDetails, { isFetching: dependencyDetailsFetching }] = useLazyGetEntityDependencyCountQuery();

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
            { number: `${res?.events?.publishedEventCount}` },
          )},  ${t('dashboard.places.deletePlace.draft', { number: `${res?.events?.draftEventCount}` })}, ${t(
            'dashboard.places.deletePlace.inReview',
            { number: `${res?.events?.pendingEventCount}` },
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
    getAllPlaces({
      calendarId,
      sessionId: timestampRef,
      pageNumber,
      query: placesSearchQuery,
      sort: sortQuery,
    });
    let params = {
      page: pageNumber,
      order: filter?.order,
      sortBy: filter?.sort,
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
  }, [pageNumber, placesSearchQuery, filter]);
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
          <LoadingIndicator data-cy="loading-indicator-place-confirm" />
        </div>
      )}
      {allPlacesSuccess && currentCalendarData ? (
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
            <></>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePlaceHandler(item?.id);
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
                  <LoadingIndicator data-cy="loading-indicator-place" />
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

export default Places;
