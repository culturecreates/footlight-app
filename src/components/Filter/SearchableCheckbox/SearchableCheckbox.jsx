import React, { useState, useEffect } from 'react';
import './searchableCheckbox.css';
import { Dropdown, Space, Typography, Checkbox } from 'antd';
import AuthenticationInput from '../../Input/Common/AuthenticationInput';

function SearchableCheckbox(props) {
  const { children, allowSearch, data, onFilterChange, open } = props;
  const [searchKey, setSearchKey] = useState();
  let item = data ?? [];
  if (allowSearch && item)
    item = [
      {
        key: 'search',
        label: <AuthenticationInput size="small" onChange={(e) => setSearchKey(e.target.value)} />,
      },
      ...item,
    ];

  const [items, setItems] = useState(item);

  useEffect(() => {
    if (allowSearch)
      setItems(
        item?.filter((item) => {
          if (item.key == 'search') return true;
          if (searchKey == '' || !searchKey) {
            return true;
          } else if (item.filtervalue?.toLowerCase().includes(searchKey)) {
            return true;
          } else return false;
        }),
      );
  }, [searchKey]);

  return (
    <Checkbox.Group onChange={onFilterChange}>
      <Dropdown
        menu={{
          items: items,
          selectable: true,
          multiple: true,
        }}
        open={open}
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
