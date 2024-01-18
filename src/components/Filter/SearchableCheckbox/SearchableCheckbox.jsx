import React, { useEffect, useState } from 'react';
import './searchableCheckbox.css';
import { Dropdown, Space, Typography, Checkbox } from 'antd';
import AuthenticationInput from '../../Input/Common/AuthenticationInput';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import NoContent from '../../NoContent/NoContent';
import LoadingIndicator from '../../LoadingIndicator';

function SearchableCheckbox(props) {
  const { children, allowSearch, data, onFilterChange, value, loading = false, selectedData, open, setOpen } = props;
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  let items = data ?? [];

  useEffect(() => {
    if (allowSearch && props?.searchKey != undefined) {
      props.searchImplementation(props?.searchKey, selectedData);
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
        open={open == undefined ? isOpen : open}
        onOpenChange={(show) => {
          if (open == undefined) setIsOpen(show);
          else setOpen(show);
        }}
        overlayClassName="searchable-checkbox-overlay"
        trigger={['click']}
        dropdownRender={() => (
          <div className="searchable-checkbox-dropdown-wrapper">
            {allowSearch && (
              <AuthenticationInput
                data-cy="input-search-entity"
                size="small"
                allowClear={true}
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
