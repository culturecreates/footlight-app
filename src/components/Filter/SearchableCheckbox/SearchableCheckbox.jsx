import React, { useState, useEffect } from 'react';
import './searchableCheckbox.css';
import { Dropdown, Space, Typography, Checkbox } from 'antd';
import AuthenticationInput from '../../Input/Common/AuthenticationInput';

function SearchableCheckbox(props) {
  const { children, allowSearch } = props;
  const [searchKey, setSearchKey] = useState();

  let item = [
    {
      key: 'bbbb',
      label: <Checkbox value="1">bbbb</Checkbox>,
    },
    {
      key: 'cccc',
      label: <Checkbox value="2">cccc</Checkbox>,
    },
    {
      key: 'dddd',
      label: <Checkbox value="3">dddd</Checkbox>,
    },
  ];
  if (allowSearch)
    item = [
      {
        key: 'aaa',
        label: <AuthenticationInput size="small" onChange={(e) => setSearchKey(e.target.value)} />,
      },
      ...item,
    ];

  const [items, setItems] = useState(item);

  useEffect(() => {
    setItems(
      item?.filter((item) => {
        if (item.key == 'aaa') return true;
        if (searchKey == '' || !searchKey) {
          return true;
        } else if (item.key.toLowerCase().includes(searchKey)) {
          return true;
        } else return false;
      }),
    );
  }, [searchKey]);

  return (
    <Checkbox.Group onChange={(checkedValues) => console.log(checkedValues)}>
      <Dropdown
        menu={{
          items: items,
          selectable: true,
          multiple: true,
        }}
        trigger={['click']}
        getPopupContainer={(trigger) => trigger.parentNode}
        {...props}>
        <Typography.Link>
          <Space>{children}</Space>
        </Typography.Link>
      </Dropdown>
    </Checkbox.Group>
  );
}

export default SearchableCheckbox;
