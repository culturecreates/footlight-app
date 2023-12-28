import React, { useEffect, useRef } from 'react';
import './eventsSearch.css';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

function EventsSearch({ autoFocus, ...props }) {
  const inputRef = useRef();
  useEffect(() => {
    if (autoFocus) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Input
      {...props}
      ref={inputRef}
      className="events-search"
      bordered={true}
      prefix={<SearchOutlined className="events-search-icon" style={{ color: props?.defaultValue && '#1B3DE6' }} />}
    />
  );
}

export default EventsSearch;
