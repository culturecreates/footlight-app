import React from 'react';
import './searchable.css';
import { Dropdown, Typography } from 'antd';

function Searchable(props) {
  const { children, itemData, open, dropdownData, onSearchClick } = props;

  return (
    <Dropdown
      menu={{
        ...(itemData && { items: itemData }),
        onClick: onSearchClick,
      }}
      open={open}
      trigger={['click']}
      dropdownRender={
        dropdownData &&
        (() => <div className="searchable-dropdown-wrapper">{dropdownData?.map((item) => item.label)}</div>)
      }
      placement="bottom"
      getPopupContainer={(trigger) => trigger.parentNode}
      {...props}>
      <Typography.Link>{children}</Typography.Link>
    </Dropdown>
  );
}

export default Searchable;
