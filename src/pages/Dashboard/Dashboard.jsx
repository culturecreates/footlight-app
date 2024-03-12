import React, { useEffect, useRef, useState } from 'react';
import './dashboard.css';
import { Grid, Layout, Row, Col } from 'antd';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar/Dashboard';
import Sidebar from '../../components/Sidebar/Main';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../constants/pathName';
import { useSelector, useDispatch } from 'react-redux';
import { getUserDetails, setUser } from '../../redux/reducer/userSlice';
import { useLazyGetCalendarQuery, useGetAllCalendarsQuery } from '../../services/calendar';
import {
  getReloadStatusForCalendar,
  setReloadCalendar,
  setSelectedCalendar,
} from '../../redux/reducer/selectedCalendarSlice';
import { setInterfaceLanguage } from '../../redux/reducer/interfaceLanguageSlice';
import i18n from 'i18next';
import Cookies from 'js-cookie';
import { useLazyGetCurrentUserQuery } from '../../services/users';
import ErrorLayout from '../../layout/ErrorLayout/ErrorLayout';
import CustomModal from '../../components/Modal/Common/CustomModal';
import { useTranslation } from 'react-i18next';
import { calendarModes } from '../../constants/calendarModes';
import { useAuth } from '../../hooks/useAuth';

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

function Dashboard() {
  useAuth();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const timestampRef = useRef(Date.now()).current;
  const { accessToken, user } = useSelector(getUserDetails);
  const [getCalendar, { currentData: currentCalendarData }] = useLazyGetCalendarQuery();
  const reloadStatus = useSelector(getReloadStatusForCalendar);
  const screens = useBreakpoint();
  const { t } = useTranslation();

  const {
    currentData: allCalendarsData,
    isLoading,
    isSuccess,
    refetch,
  } = useGetAllCalendarsQuery({ sessionId: timestampRef }, { skip: accessToken ? false : true });

  const [getCurrentUserDetails] = useLazyGetCurrentUserQuery();

  let { calendarId } = useParams();
  let [searchParams] = useSearchParams();

  const [pageNumber, setPageNumber] = useState(
    searchParams.get('page') ? searchParams.get('page') : Cookies.get('page') ?? 1,
  );
  const [contentBackgroundColor, setContentBackgroundColor] = useState('#fff');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (!accessToken && accessToken === '') {
      const accessToken = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');

      if (!calendarId) {
        calendarId = Cookies.get('calendarId');
      }
      if (accessToken && calendarId) {
        getCurrentUserDetails({ accessToken: accessToken, calendarId: calendarId })
          .unwrap()
          .then((response) => {
            dispatch(
              setUser({ user: { ...response }, refreshToken: { token: refreshToken }, accessToken: accessToken }),
            );
          });
      } else {
        navigate(PathName.Login);
      }
    } else {
      if (location?.state?.previousPath?.toLowerCase() === 'login' || !calendarId)
        dispatch(setInterfaceLanguage(user?.interfaceLanguage?.toLowerCase()));
      i18n.changeLanguage(user?.interfaceLanguage?.toLowerCase());
    }
  }, [accessToken]);

  useEffect(() => {
    if (isSuccess) {
      const checkedCalendarId = findActiveCalendar();
      if (checkedCalendarId != null) {
        Cookies.set('calendarId', checkedCalendarId);
      }

      if (calendarId && accessToken) {
        getCalendar({ id: calendarId, sessionId: timestampRef })
          .unwrap()
          .then((response) => {
            if (response?.mode === calendarModes.READ_ONLY) {
              setIsReadOnly(true);
              setIsModalVisible(true);
            } else setIsReadOnly(false);
          })
          .catch((error) => {
            if (error.status === 404) {
              navigate(PathName.NotFound);
            }
          });
        dispatch(setSelectedCalendar(String(calendarId)));
      } else {
        let activeCalendarId = Cookies.get('calendarId');
        if (activeCalendarId && accessToken) {
          navigate(`${PathName.Dashboard}/${activeCalendarId}${PathName.Events}`);
        } else if (!isLoading && allCalendarsData?.data) {
          activeCalendarId = allCalendarsData?.data[0]?.id;
          Cookies.set('calendarId', activeCalendarId);
          navigate(`${PathName.Dashboard}/${activeCalendarId}${PathName.Events}`);
        }
      }
    }
  }, [calendarId, isLoading, allCalendarsData, isSuccess]);

  useEffect(() => {
    if (reloadStatus) {
      refetch();
      dispatch(setReloadCalendar(false));
    }
  }, [reloadStatus, dispatch]);

  const findActiveCalendar = () => {
    const currentCalendar = allCalendarsData.data.filter((item) => {
      if (item.id === calendarId) {
        return item;
      }
    });
    if (currentCalendar.length < 1) {
      return allCalendarsData.data[0].id;
    }
    return null;
  };

  return (
    <ErrorLayout>
      <Layout className="dashboard-wrapper">
        <Header className="dashboard-header">
          <NavigationBar
            currentCalendarData={currentCalendarData}
            allCalendarsData={allCalendarsData}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
          />
        </Header>
        <Layout>
          <Sidebar
            currentCalendarData={currentCalendarData}
            allCalendarsData={allCalendarsData}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
          />
          <Layout style={{ position: 'relative' }}>
            <Content
              className="site-layout-background"
              style={{
                padding: `${screens.md ? '34px 32px 32px 32px' : '32px 16px'}`,
                margin: 0,
                minHeight: 280,
                overflowY: 'scroll',
                background: contentBackgroundColor,
              }}>
              <CustomModal
                open={isModalVisible}
                centered
                className="calendar-read-only-modal"
                title={
                  <span className="calendar-read-only-title" data-cy="span-calendar-read-only-title">
                    {t('dashboard.calendar.readOnlyMode.heading')}
                  </span>
                }
                onCancel={() => setIsModalVisible(false)}
                footer={false}>
                <Row gutter={[0, 10]}>
                  <Col span={24}>
                    <div className="calendar-read-only-content" data-cy="div-calendar-read-only-content">
                      {t('dashboard.calendar.readOnlyMode.content')}
                    </div>
                  </Col>
                </Row>
              </CustomModal>
              <Outlet
                context={[
                  currentCalendarData,
                  pageNumber,
                  setPageNumber,
                  getCalendar,
                  setContentBackgroundColor,
                  isReadOnly,
                ]}
              />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ErrorLayout>
  );
}

export default Dashboard;
