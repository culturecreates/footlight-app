import React from 'react';
import './eventsSearch.css';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

function EventsSearch(props) {
  return (
    <Input
      {...props}
      className="events-search"
      bordered={true}
      prefix={<SearchOutlined className="events-search-icon" style={{ color: props?.defaultValue && '#1B3DE6' }} />}
    />
  );
}

export default EventsSearch;
