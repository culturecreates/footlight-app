import React, { useState, useEffect } from 'react';
import './searchableCheckbox.css';
import { Dropdown, Space, Typography, Checkbox } from 'antd';
import AuthenticationInput from '../../Input/Common/AuthenticationInput';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import NoContent from '../../NoContent/NoContent';

function SearchableCheckbox(props) {
  const { children, allowSearch, data, onFilterChange, open, value } = props;
  const { t } = useTranslation();
  const [searchKey, setSearchKey] = useState();
  let item = data ?? [];

  const [items, setItems] = useState(item);

  useEffect(() => {
    if (allowSearch)
      setItems(
        item?.filter((item) => {
          if (searchKey == '' || !searchKey) {
            return true;
          } else if (item.filtervalue?.toLowerCase().includes(searchKey)) {
            return true;
          } else return false;
        }),
      );
  }, [searchKey]);

  return (
    <Checkbox.Group onChange={onFilterChange} value={value}>
      <Dropdown
        menu={{
          items: items,
          selectable: true,
          multiple: true,
        }}
        open={open}
        trigger={['click']}
        dropdownRender={() => (
          <div className="searchable-checkbox-dropdown-wrapper">
            {allowSearch && (
              <AuthenticationInput
                size="small"
                placeholder={t('dashboard.events.filter.users.placeholderSearch')}
                onChange={(e) => setSearchKey(e.target.value)}
                prefix={<SearchOutlined />}
              />
            )}
            <div className="searchable-checkbox-dropdown-content">
              {items?.length > 0 ? items?.map((item, index) => <span key={index}>{item.label}</span>) : <NoContent />}
            </div>
          </div>
        )}
        placement="bottom"
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
