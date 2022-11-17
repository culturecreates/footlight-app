import React from 'react';
import './dashboardNavigationBar.css';
import Dropdown from '../../Dropdown';

function NavigationBar() {
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
      <Dropdown />
    </div>
  );
}

export default NavigationBar;
