import React, { useState, useEffect, useRef } from 'react';
import './organizations.css';
import { List, Grid, Modal } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
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
import { useOutletContext, useParams } from 'react-router-dom';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import { userRoles } from '../../../constants/userRoles';
const { confirm } = Modal;
const { useBreakpoint } = Grid;

function Organizations() {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId } = useParams();
  const { user } = useSelector(getUserDetails);
  const [currentCalendarData] = useOutletContext();

  const [
    getAllOrganization,
    { currentData: allOrganizationData, isFetching: allOrganizationFetching, isSuccess: allOrganizationSuccess },
  ] = useLazyGetAllOrganizationQuery();
  const [deleteOrganization] = useDeleteOrganizationMutation();

  const [pageNumber, setPageNumber] = useState(1);

  const totalCount = allOrganizationData?.count;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  const deleteOrganizationHandler = (organizationId) => {
    confirm({
      title: t('dashboard.organization.deleteOrganization.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('dashboard.organization.deleteOrganization.description'),
      okText: t('dashboard.organization.deleteOrganization.ok'),
      okType: 'danger',
      cancelText: t('dashboard.organization.deleteOrganization.cancel'),
      className: 'delete-modal-container',
      onOk() {
        deleteOrganization({ id: organizationId, calendarId: calendarId });
      },
    });
  };

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };

  useEffect(() => {
    getAllOrganization({
      calendarId,
      sessionId: timestampRef,
    });
  }, []);
  return (
    allOrganizationSuccess && (
      <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
        <Main>
          <h4 className="events-heading">{t('dashboard.organization.organizations')}</h4>
          <AddOrganization label={t('dashboard.organization.organization')} />
          <OrganizationSearch
            placeholder={t('dashboard.organization.search.placeholder')}
            //   onPressEnter={(e) => onSearchHandler(e)}
            //   defaultValue={eventSearchQuery}
            allowClear={true}
            //   onChange={onChangeHandler}
          />
          <Sort />
          <></>
          {allOrganizationFetching && (
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingIndicator />
            </div>
          )}
          {!allOrganizationFetching &&
            (allOrganizationData?.data?.length > 0 ? (
              <List
                className="event-list-wrapper"
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
                    artsDataLink={artsDataLinkChecker(item?.sameAs)}
                    actions={[
                      adminCheckHandler() && (
                        <DeleteOutlined
                          key={'delete-icon'}
                          style={{ color: '#222732', fontSize: '24px' }}
                          onClick={() => deleteOrganizationHandler(item?.id)}
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

export default Organizations;
