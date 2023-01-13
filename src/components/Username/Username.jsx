import React from 'react';
import './username.css';

function Username(props) {
  const { firstName, lastName } = props;
  return (
    <span className="event-list-status-userdetail">
      {firstName?.charAt(0)}
      {lastName}
    </span>
  );
}

export default Username;
