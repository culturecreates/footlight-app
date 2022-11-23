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
      prefix={<SearchOutlined className="events-search-icon" />}
    />
  );
}

export default EventsSearch;
