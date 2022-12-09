import React, { useState } from 'react';
import './dashboardNavigationBar.css';
import UserProfileDropdown from '../../Dropdown/UserProfile';
import { MenuOutlined } from '@ant-design/icons';
import ResponsiveSidebar from '../../Sidebar/Responsive';

function NavigationBar(props) {
  const { currentCalendarData, allCalendarsData } = props;

  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="navigation-bar-wrapper">
      <div className="logo-wrapper">
        <img
          src={require('../../../assets/images/footlight-logo-small.png')}
          alt="Footlight logo"
          className="footlight-logo"
        />
        <h6 className="logo-name">Footlight</h6>
      </div>
      <UserProfileDropdown className="navigation-user-profile-dropdown" />
      <MenuOutlined onClick={showDrawer} className="navigation-responsive-sidebar-menu" />
      <ResponsiveSidebar
        allCalendarsData={allCalendarsData}
        currentCalendarData={currentCalendarData}
        onClose={onClose}
        open={open}
      />
    </div>
  );
}

export default NavigationBar;
