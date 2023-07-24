import React from 'react';
import { sortByOptionsOrgsPlacesPerson, sortOrder } from '../../constants/sortByOptions';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Space } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';

function Sort(props) {
  const { filter, setFilter, setPageNumber } = props;
  const { t } = useTranslation();
  const onSortOrderChange = () => {
    if (filter?.order == sortOrder?.ASC)
      setFilter({
        ...filter,
        order: sortOrder?.DESC,
      });
    else if (filter?.order == sortOrder?.DESC)
      setFilter({
        ...filter,
        order: sortOrder?.ASC,
      });
    setPageNumber(1);
  };
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <span style={{ fontSize: '16px', fontWeight: 700 }}>{t('dashboard.events.filter.sort.sortBy')}</span>

      <Dropdown
        overlayClassName="filter-sort-dropdown-wrapper"
        overlayStyle={{ minWidth: '200px' }}
        getPopupContainer={(trigger) => trigger.parentNode}
        menu={{
          items: sortByOptionsOrgsPlacesPerson,
          selectable: true,
          defaultSelectedKeys: [filter?.sort],
          // onSelect: onSortSelect,
        }}
        trigger={['click']}
        open={false}>
        <Button size="large" className="filter-sort-button" style={{ cursor: 'default' }}>
          <Space>
            {sortByOptionsOrgsPlacesPerson?.map((sortBy, index) => {
              if (sortBy?.key === filter?.sort) return <span key={index}>{sortBy?.label}</span>;
            })}
            {/* <DownOutlined style={{ fontSize: '12px', color: '#222732' }} /> */}
          </Space>
        </Button>
      </Dropdown>

      <Button
        className="filter-sort-button"
        style={{ borderColor: filter?.order && '#1B3DE6' }}
        onClick={onSortOrderChange}
        icon={
          filter?.order === sortOrder?.ASC ? (
            <SortAscendingOutlined style={{ color: '#1B3DE6', fontSize: '24px' }} />
          ) : (
            filter?.order === sortOrder?.DESC && (
              <SortDescendingOutlined style={{ color: '#1B3DE6', fontSize: '24px' }} />
            )
          )
        }
        size={'large'}
      />
    </div>
  );
}

export default Sort;
