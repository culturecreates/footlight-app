import React, { useEffect, useRef, useState } from 'react';
import './organizations.css';
import { List, Grid } from 'antd';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import Main from '../../../layout/Main/Main';
import OrganizationSearch from '../../../components/Search/Events/EventsSearch';
import AddOrganization from '../../../components/Button/AddEvent';
import Sort from '../../../components/Sort/Sort';
import NoContent from '../../../components/NoContent/NoContent';
import ListItem from '../../../components/List/ListItem.jsx/ListItem';
import { useDeleteOrganizationMutation, useLazyGetAllOrganizationQuery } from '../../../services/organization';
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
import { PathName } from '../../../constants/pathName';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import { userRoles } from '../../../constants/userRoles';
import { ReactComponent as OrganizationLogo } from '../../../assets/icons/organization-light.svg';
import { sortByOptionsOrgsPlacesPerson, sortOrder } from '../../../constants/sortByOptions';
import i18n from 'i18next';
import { Confirm } from '../../../components/Modal/Confirm/Confirm';
import { useLazyGetEntityDependencyCountQuery } from '../../../services/entities';

const { useBreakpoint } = Grid;

function Organizations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
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

  const [
    getAllOrganization,
    { currentData: allOrganizationData, isFetching: allOrganizationFetching, isSuccess: allOrganizationSuccess },
  ] = useLazyGetAllOrganizationQuery();

  const [getDependencyDetails, { isFetching: dependencyDetailsFetching }] = useLazyGetEntityDependencyCountQuery();
  const [deleteOrganization] = useDeleteOrganizationMutation();

  const [pageNumber, setPageNumber] = useState(
    searchParams.get('page') ? searchParams.get('page') : sessionStorage.getItem('organizationPage') ?? 1,
  );
  const [organizationSearchQuery, setOrganizationSearchQuery] = useState(
    searchParams.get('query') ? searchParams.get('query') : sessionStorage.getItem('organizationSearchQuery') ?? '',
  );
  const [filter, setFilter] = useState({
    sort: sortByOptionsOrgsPlacesPerson[0]?.key,
    order: searchParams.get('order')
      ? searchParams.get('order')
      : sessionStorage.getItem('organizationOrder') ?? sortOrder?.ASC,
  });

  const totalCount = allOrganizationData?.count;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  const deleteOrganizationHandler = (organizationId) => {
    getDependencyDetails({ ids: organizationId, calendarId })
      .unwrap()
      .then((res) => {
        Confirm({
          title: t('dashboard.organization.deleteOrganization.title'),
          content: `${t('dashboard.organization.deleteOrganization.description')} ${t(
            'dashboard.organization.deleteOrganization.impact',
          )}  
          ${t('dashboard.organization.deleteOrganization.published', {
            number: `${res?.events?.publishedEventCount}`,
          })}, 
          ${t('dashboard.organization.deleteOrganization.draft', { number: `${res?.events?.draftEventCount}` })}, 
          ${t('dashboard.organization.deleteOrganization.inReview', {
            number: `${res?.events?.pendingEventCount}`,
          })}.`,
          okText: t('dashboard.organization.deleteOrganization.ok'),
          cancelText: t('dashboard.organization.deleteOrganization.cancel'),
          className: 'delete-modal-container',
          onAction: () => {
            deleteOrganization({ id: organizationId, calendarId: calendarId });
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
    setOrganizationSearchQuery(event.target.value);
  };
  const onChangeHandler = (event) => {
    if (event.target.value === '') setOrganizationSearchQuery('');
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
    getAllOrganization({
      calendarId,
      sessionId: timestampRef,
      pageNumber,
      query: organizationSearchQuery,
      sort: sortQuery,
    });
    let params = {
      page: pageNumber,
      order: filter?.order,
      sortBy: filter?.sort,
    };
    if (organizationSearchQuery && organizationSearchQuery !== '')
      params = {
        ...params,
        query: organizationSearchQuery,
      };
    setSearchParams(createSearchParams(params));
    sessionStorage.setItem('organizationPage', pageNumber);
    sessionStorage.setItem('organizationSearchQuery', organizationSearchQuery);
    sessionStorage.setItem('organizationOrder', filter?.order);
  }, [pageNumber, organizationSearchQuery, filter]);
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
          <LoadingIndicator data-cy="organizations-listing-loader-confirm" />
        </div>
      )}
      {allOrganizationSuccess && (
        <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
          <Main>
            <h4 className="events-heading" data-cy="heading-organizations">
              {t('dashboard.organization.organizations')}
            </h4>
            <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
              <AddOrganization
                disabled={isReadOnly ? true : false}
                label={t('dashboard.organization.organization')}
                onClick={() =>
                  navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.Search}`)
                }
                data-cy="button-add-organization"
              />
            </FeatureFlag>

            <OrganizationSearch
              placeholder={t('dashboard.organization.search.placeholder')}
              onPressEnter={(e) => onSearchHandler(e)}
              defaultValue={organizationSearchQuery}
              allowClear={true}
              onChange={onChangeHandler}
              data-cy="input-search-organizations"
            />
            <Sort filter={filter} setFilter={setFilter} setPageNumber={setPageNumber} />
            <></>
            <div className="responsvie-list-wrapper-class">
              {!allOrganizationFetching ? (
                allOrganizationData?.data?.length > 0 ? (
                  <List
                    data-cy="antd-organizations-list"
                    // className="event-list-wrapper"
                    itemLayout={screens.xs ? 'vertical' : 'horizontal'}
                    dataSource={allOrganizationData?.data}
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
                        data-cy={`antd-organization-list-item-${index}`}
                        key={index}
                        id={index}
                        logo={item?.logo?.thumbnail?.uri}
                        defaultLogo={
                          <Icon
                            component={OrganizationLogo}
                            style={{ color: '#607EFC', fontSize: '18px' }}
                            data-cy="organization-logo"
                          />
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
                              key={'delete-icon'}
                              style={{ color: '#222732', fontSize: '24px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteOrganizationHandler(item?.id);
                              }}
                              data-cy="delete-organization"
                            />
                          ),
                        ]}
                      />
                    )}
                  />
                ) : (
                  <NoContent style={{ height: '200px' }} data-cy="empty-organization" />
                )
              ) : (
                <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LoadingIndicator data-cy="organizations-listing-loader" />
                </div>
              )}
            </div>
          </Main>
        </FeatureFlag>
      )}
    </>
  );
}

export default Organizations;
