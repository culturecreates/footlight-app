import React, { useEffect, useRef, useState } from 'react';
import './dashboard.css';
import { Layout } from 'antd';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar/Dashboard';
import Sidebar from '../../components/Sidebar/Main';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../constants/pathName';
import { useSelector, useDispatch } from 'react-redux';
import { getUserDetails, setUser } from '../../redux/reducer/userSlice';
import { useLazyGetCalendarQuery, useGetAllCalendarsQuery } from '../../services/calendar';
import { setSelectedCalendar } from '../../redux/reducer/selectedCalendarSlice';
import { setInterfaceLanguage } from '../../redux/reducer/interfaceLanguageSlice';
import i18n from 'i18next';
import Cookies from 'js-cookie';
import { useLazyGetCurrentUserQuery } from '../../services/users';

const { Header, Content } = Layout;

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const timestampRef = useRef(Date.now()).current;
  const { accessToken, user } = useSelector(getUserDetails);
  const [getCalendar, { currentData: currentCalendarData }] = useLazyGetCalendarQuery();

  const { currentData: allCalendarsData, isLoading } = useGetAllCalendarsQuery(
    { sessionId: timestampRef },
    { skip: accessToken ? false : true },
  );

  const [getCurrentUserDetails] = useLazyGetCurrentUserQuery();

  let { calendarId } = useParams();
  let [searchParams] = useSearchParams();

  const [pageNumber, setPageNumber] = useState(
    searchParams.get('page') ? searchParams.get('page') : Cookies.get('page') ?? 1,
  );

  useEffect(() => {
    if (!accessToken && accessToken === '') {
      const accessToken = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');

      if (!calendarId) {
        calendarId = Cookies.get('calendarId');
      }
      if (accessToken) {
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
    if (calendarId && accessToken) {
      getCalendar({ id: calendarId, sessionId: timestampRef });
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
  }, [calendarId, isLoading, allCalendarsData]);

  return (
    <Layout className="dashboard-wrapper">
      <Header className="dashboard-header">
        <NavigationBar currentCalendarData={currentCalendarData} allCalendarsData={allCalendarsData} />
      </Header>
      <Layout>
        <Sidebar
          currentCalendarData={currentCalendarData}
          allCalendarsData={allCalendarsData}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
        />
        <Layout
          style={{
            background: '#ffffff',
          }}>
          <Content
            className="site-layout-background"
            style={{
              padding: '34px 32px 32px 32px',
              margin: 0,
              minHeight: 280,
              overflowY: 'scroll',
              background: '#F9FAFF',
            }}>
            <Outlet context={[currentCalendarData, pageNumber, setPageNumber]} />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default Dashboard;
