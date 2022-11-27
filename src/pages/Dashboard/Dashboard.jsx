import React, { useEffect } from 'react';
import './dashboard.css';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar/Dashboard';
import Sidebar from '../../components/Sidebar/Main';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../constants/pathName';
import { useSelector, useDispatch } from 'react-redux';
import { getUserDetails } from '../../redux/reducer/userSlice';
import { useLazyGetCalendarQuery, useGetAllCalendarsQuery } from '../../services/calendar';
import { setSelectedCalendar } from '../../redux/reducer/selectedCalendarSlice';

const { Header, Content } = Layout;

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [getCalendar, { data: currentCalendarData }] = useLazyGetCalendarQuery();
  const { data: allCalendarsData } = useGetAllCalendarsQuery();

  let { calendarId } = useParams();
  const { accessToken } = useSelector(getUserDetails);

  useEffect(() => {
    if (!accessToken && accessToken === '') navigate(PathName.Login);
  }, [accessToken]);

  useEffect(() => {
    if (calendarId) {
      getCalendar({ id: calendarId });
      dispatch(setSelectedCalendar(String(calendarId)));
    }
  }, [calendarId]);
  return (
    <Layout className="dashboard-wrapper">
      <Header className="dashboard-header">
        <NavigationBar />
      </Header>
      <Layout>
        <Sidebar currentCalendarData={currentCalendarData} allCalendarsData={allCalendarsData} />
        <Layout
          style={{
            background: '#ffffff',
          }}>
          <Content
            className="site-layout-background"
            style={{
              padding: '34px 32px 0px 32px',
              margin: 0,
              minHeight: 280,
              overflowY: 'scroll',
            }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default Dashboard;
