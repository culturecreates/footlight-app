import React from 'react';
import './username.css';

function Username(props) {
  const { firstName, lastName, userName } = props;

  return (
    <span className="event-list-status-userdetail" {...props}>
      {userName ? userName : `${firstName?.charAt(0)}${lastName}`}
    </span>
  );
}

export default Username;
