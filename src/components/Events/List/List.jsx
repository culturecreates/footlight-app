import React from 'react';
import './list.css';
import { List } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import EventStatus from '../../Tags/Events';
import EventNumber from '../../Tags/EventNumber';

const data = [
  {
    title: 'Ant Design Title 1',
  },
  {
    title: 'Ant Design Title 2',
  },
  {
    title: 'Ant Design Title 3',
  },
  {
    title: 'Ant Design Title 4',
  },
];

function Lists() {
  return (
    <List
      className="event-list-wrapper"
      itemLayout="horizontal"
      dataSource={data}
      bordered={false}
      pagination={{
        onChange: (page) => {
          console.log(page);
        },
        pageSize: 3,
      }}
      renderItem={(item, index) => (
        <List.Item actions={[<MoreOutlined className="event-list-more-icon" key={index} />]}>
          <List.Item.Meta
            avatar={<img src="https://joeschmoe.io/api/v1/random" className="event-list-image" />}
            title={
              <div className="event-list-title">
                <span className="event-list-title-heading">{item.title}</span>&nbsp;&nbsp;
                <EventNumber label="24" />
              </div>
            }
            description={
              <div className="event-list-description">
                <span className="event-list-description-name">{item.title}</span>
                <span className="event-list-description-place">{item.title}</span>
              </div>
            }
          />
          <List.Item.Meta
            style={{ textAlign: 'right' }}
            title={<EventStatus label="waiting for approval" />}
            description={
              <div className="event-list-status">
                <span>
                  Created by&nbsp;<span className="event-list-status-userdetail">username</span>
                </span>
                <span>
                  Updated 17-OCT-2022 by&nbsp;<span className="event-list-status-userdetail">username</span>
                </span>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}

export default Lists;
