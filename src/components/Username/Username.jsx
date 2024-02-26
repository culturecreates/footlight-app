import React from 'react';
import './username.css';

function Username(props) {
  const { userName, ...rest } = props;

  return (
    <span className="event-list-status-userdetail" {...rest}>
      {userName ? userName : `${rest?.firstName?.charAt(0)}${rest?.lastName}`}
    </span>
  );
}

export default Username;
