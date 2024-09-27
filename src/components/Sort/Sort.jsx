import React from 'react';
import { sortByOptionsOrgsPlacesPerson, sortOrder } from '../../constants/sortByOptions';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Space } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined, DownOutlined, CloseCircleOutlined } from '@ant-design/icons';

function Sort(props) {
  const { filter, setFilter, setPageNumber, filterClearHandler } = props;
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

  const onSortSelect = ({ selectedKeys }) => {
    setFilter({
      ...filter,
      sort: selectedKeys[0],
      order: sortOrder?.ASC,
    });
    setPageNumber(1);
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <span style={{ fontSize: '16px', fontWeight: 700 }} data-cy="span-sort-by-title">
        {t('dashboard.events.filter.sort.sortBy')}
      </span>

      <Dropdown
        overlayClassName="filter-sort-dropdown-wrapper"
        overlayStyle={{ minWidth: '200px' }}
        getPopupContainer={(trigger) => trigger.parentNode}
        menu={{
          items: sortByOptionsOrgsPlacesPerson,
          selectable: true,
          defaultSelectedKeys: [filter?.sort],
          onSelect: onSortSelect,
        }}
        trigger={['click']}
        data-cy="dropdown-sort-options">
        <Button size="large" className="filter-sort-button" style={{ cursor: 'default' }} data-cy="button-sort-options">
          <Space>
            {sortByOptionsOrgsPlacesPerson?.map((sortBy, index) => {
              if (sortBy?.key === filter?.sort)
                return (
                  <span key={index} data-cy={`span-sort-option-${sortBy['data-cy']}`}>
                    {sortBy?.label}
                  </span>
                );
            })}
            <DownOutlined style={{ fontSize: '12px', color: '#222732' }} />
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
        data-cy="button-sort-order"
      />
      {(filter?.order === sortOrder?.DESC || filter?.sort != sortByOptionsOrgsPlacesPerson[0]?.key) && (
        <Button
          size="large"
          className="filter-buttons"
          style={{ color: '#1B3DE6' }}
          onClick={filterClearHandler}
          data-cy="button-filter-clear">
          {t('dashboard.events.filter.clear')}&nbsp;
          <CloseCircleOutlined style={{ color: '#1B3DE6', fontSize: '16px' }} />
        </Button>
      )}
    </div>
  );
}

export default Sort;
