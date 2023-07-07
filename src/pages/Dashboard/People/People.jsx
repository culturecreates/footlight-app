import React, { useRef, useState, useEffect } from 'react';
import './people.css';
import { List, Grid, Modal } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
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
import { useOutletContext, useParams } from 'react-router-dom';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import { userRoles } from '../../../constants/userRoles';
import { useDeletePlacesMutation, useLazyGetAllPlacesQuery } from '../../../services/places';
const { confirm } = Modal;
const { useBreakpoint } = Grid;

function People() {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId } = useParams();
  const { user } = useSelector(getUserDetails);
  const [currentCalendarData] = useOutletContext();

  const [getAllPlaces, { currentData: allPlacesData, isFetching: allPlacesFetching, isSuccess: allPlacesSuccess }] =
    useLazyGetAllPlacesQuery();
  const [deletePlaces] = useDeletePlacesMutation();

  const [pageNumber, setPageNumber] = useState(1);

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

  useEffect(() => {
    getAllPlaces({
      calendarId,
      sessionId: timestampRef,
    });
  }, []);
  return (
    allPlacesSuccess && (
      <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
        <Main>
          <h4 className="events-heading">{t('dashboard.places.places')}</h4>
          <AddPlace label={t('dashboard.places.place')} />
          <PlaceSearch
            placeholder={t('dashboard.places.search.placeholder')}
            //   onPressEnter={(e) => onSearchHandler(e)}
            //   defaultValue={eventSearchQuery}
            allowClear={true}
            //   onChange={onChangeHandler}
          />
          <Sort />
          <></>
          {allPlacesFetching && (
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingIndicator />
            </div>
          )}
          {!allPlacesFetching &&
            (allPlacesData?.data?.length > 0 ? (
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
                    createdByFirstName={item?.creator?.firstName}
                    createdByLastName={item?.creator?.lastName}
                    updatedDate={item?.modifier?.date}
                    updatedByFirstName={item?.modifier?.firstName}
                    updatedByLastName={item?.modifier?.lastName}
                    artsDataLink={artsDataLinkChecker(item?.sameAs)}
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
            ))}
        </Main>
      </FeatureFlag>
    )
  );
}

export default People;
