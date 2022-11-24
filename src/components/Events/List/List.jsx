import React from 'react';
import './list.css';
import { List } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import EventStatus from '../../Tags/Events';

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
        <List.Item actions={[<MoreOutlined style={{ fontSize: '24px' }} key={index} />]}>
          <List.Item.Meta
            avatar={<img src="https://joeschmoe.io/api/v1/random" style={{ height: '104px', width: '104px' }} />}
            title={
              <div style={{ display: 'flex' }}>
                <a href="https://ant.design">{item.title}</a>&nbsp;&nbsp;
                <a href="https://ant.design">{item.title}</a>
              </div>
            }
            description={
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <a href="https://ant.design">{item.title}</a>
                <a href="https://ant.design">{item.title}</a>
              </div>
            }
          />
          <List.Item.Meta
            style={{ textAlign: 'right' }}
            title={<EventStatus label="waiting for approval" />}
            description={
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <a href="https://ant.design">{item.title}</a>
                <a href="https://ant.design">{item.title}</a>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}

export default Lists;
