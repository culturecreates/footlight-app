import React from 'react';
import './navigationBar.css';
import OutlinedButton from '../Button/Outlined';

function NavigationBar() {
  return (
    <div className="navigation-bar-wrapper">
      <div className="logo-wrapper">
        <img
          src={require('../../assets/images/footlight-logo-small.png')}
          alt="Footlight logo"
          className="footlight-logo"
        />
        <h6 className="logo-name">Footlight</h6>
      </div>
      <div>
        <OutlinedButton label="Français" />
      </div>
    </div>
  );
}

export default NavigationBar;
