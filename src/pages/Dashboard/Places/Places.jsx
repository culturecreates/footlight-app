import React, { useRef, useState, useEffect } from 'react';
import './places.css';
import { List, Grid, Modal } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
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

const { confirm } = Modal;
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
  const [currentCalendarData] = useOutletContext();

  const [getAllPlaces, { currentData: allPlacesData, isFetching: allPlacesFetching, isSuccess: allPlacesSuccess }] =
    useLazyGetAllPlacesQuery();
  const [deletePlaces] = useDeletePlacesMutation();

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
    confirm({
      title: t('dashboard.places.deletePlace.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('dashboard.places.deletePlace.description'),
      okText: t('dashboard.places.deletePlace.ok'),
      okType: 'danger',
      cancelText: t('dashboard.places.deletePlace.cancel'),
      className: 'delete-modal-container',
      onOk() {
        deletePlaces({ id: placeId, calendarId: calendarId });
      },
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
    allPlacesSuccess && (
      <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
        <Main>
          <h4 className="events-heading">{t('dashboard.places.places')}</h4>
          <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
            <AddPlace
              label={t('dashboard.places.place')}
              onClick={() => {
                navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.Search}`);
              }}
            />
          </FeatureFlag>

          <PlaceSearch
            placeholder={t('dashboard.places.search.placeholder')}
            onPressEnter={(e) => onSearchHandler(e)}
            defaultValue={placesSearchQuery}
            allowClear={true}
            onChange={onChangeHandler}
          />
          <Sort filter={filter} setFilter={setFilter} setPageNumber={setPageNumber} />
          <></>

          {!allPlacesFetching ? (
            allPlacesData?.data?.length > 0 ? (
              <List
                className="event-list-wrapper"
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
                    key={index}
                    id={index}
                    logo={item?.logo?.thumbnail?.uri}
                    defaultLogo={<EnvironmentOutlined style={{ color: '#607EFC', fontSize: '18px' }} />}
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
                      adminCheckHandler() && (
                        <DeleteOutlined
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
              <LoadingIndicator />
            </div>
          )}
        </Main>
      </FeatureFlag>
    )
  );
}

export default Places;
