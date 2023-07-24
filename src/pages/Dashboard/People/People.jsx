import React, { useRef, useState, useEffect } from 'react';
import './people.css';
import { List, Grid, Modal } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
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

const { confirm } = Modal;
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
  const [currentCalendarData] = useOutletContext();

  const [getAllPeople, { currentData: allPeopleData, isFetching: allPeopleFetching, isSuccess: allPeopleSuccess }] =
    useLazyGetAllPeopleQuery();
  const [deletePerson] = useDeletePersonMutation();

  const [pageNumber, setPageNumber] = useState(
    searchParams.get('page') ? searchParams.get('page') : sessionStorage.getItem('peoplePage') ?? 1,
  );
  const [peopleSearchQuery, setPeopleSearchQuery] = useState(
    searchParams.get('query') ? searchParams.get('query') : sessionStorage.getItem('peopleSearchQuery') ?? '',
  );
  const [filter, setFilter] = useState({
    sort: sortByOptionsOrgsPlacesPerson[0]?.key,
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
    confirm({
      title: t('dashboard.people.deletePerson.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('dashboard.people.deletePerson.description'),
      okText: t('dashboard.people.deletePerson.ok'),
      okType: 'danger',
      cancelText: t('dashboard.people.deletePerson.cancel'),
      className: 'delete-modal-container',
      onOk() {
        deletePerson({ id: personId, calendarId: calendarId });
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
    setPeopleSearchQuery(event.target.value);
  };
  const onChangeHandler = (event) => {
    if (event.target.value === '') setPeopleSearchQuery('');
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
  }, [pageNumber, peopleSearchQuery, filter]);
  return (
    allPeopleSuccess && (
      <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
        <Main>
          <h4 className="events-heading">{t('dashboard.people.people')}</h4>
          <AddPerson label={t('dashboard.people.person')} />
          <PersonSearch
            placeholder={t('dashboard.people.search.placeholder')}
            onPressEnter={(e) => onSearchHandler(e)}
            defaultValue={peopleSearchQuery}
            allowClear={true}
            onChange={onChangeHandler}
          />
          <Sort filter={filter} setFilter={setFilter} setPageNumber={setPageNumber} />
          <></>

          {!allPeopleFetching ? (
            allPeopleData?.data?.length > 0 ? (
              <List
                className="event-list-wrapper"
                itemLayout={screens.xs ? 'vertical' : 'horizontal'}
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
                    key={index}
                    id={index}
                    logo={item?.logo?.thumbnail?.uri}
                    defaultLogo={<UserOutlined style={{ color: '#607EFC', fontSize: '18px' }} />}
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
                    listItemHandler={() => listItemHandler(item?.id)}
                    actions={[
                      adminCheckHandler() && (
                        <DeleteOutlined
                          key={'delete-icon'}
                          style={{ color: '#222732', fontSize: '24px' }}
                          onClick={() => deletePersonHandler(item?.id)}
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

export default People;
