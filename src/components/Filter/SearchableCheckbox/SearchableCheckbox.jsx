import React, { useEffect } from 'react';
import './searchableCheckbox.css';
import { Dropdown, Space, Typography, Checkbox } from 'antd';
import AuthenticationInput from '../../Input/Common/AuthenticationInput';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import NoContent from '../../NoContent/NoContent';
import LoadingIndicator from '../../LoadingIndicator';

function SearchableCheckbox(props) {
  const { children, allowSearch, data, onFilterChange, open, value, loading = false } = props;
  const { t } = useTranslation();
  let items = data ?? [];

  useEffect(() => {
    if (allowSearch) {
      props.searchImplementation();
    }
  }, [props.searchKey]);

  return (
    <Checkbox.Group onChange={onFilterChange} value={value}>
      <Dropdown
        data-cy="dropdown-searchable-checkbox"
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
                data-cy="input-search-entity"
                size="small"
                placeholder={t('dashboard.events.filter.users.placeholderSearch')}
                onChange={(e) => props.setSearchKey(e.target.value)}
                prefix={<SearchOutlined />}
              />
            )}
            {!loading ? (
              <div className="searchable-checkbox-dropdown-content">
                {items?.length > 0 ? (
                  items?.map((item, index) => <span key={item.id || index}>{item.label}</span>)
                ) : (
                  <NoContent />
                )}
              </div>
            ) : (
              <div style={{ padding: 20, display: 'grid', placeContent: 'center' }}>
                <LoadingIndicator />
              </div>
            )}
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
