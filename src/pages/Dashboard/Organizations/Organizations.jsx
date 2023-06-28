import React, { useState } from 'react';
import './organizations.css';
import { List, Grid } from 'antd';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import Main from '../../../layout/Main/Main';
import OrganizationSearch from '../../../components/Search/Events/EventsSearch';
import AddOrganization from '../../../components/Button/AddEvent';
import Sort from '../../../components/Sort/Sort';
import NoContent from '../../../components/NoContent/NoContent';
import ListItem from '../../../components/List/ListItem.jsx/ListItem';
const { useBreakpoint } = Grid;

function Organizations() {
  const { t } = useTranslation();
  const screens = useBreakpoint();

  const [pageNumber, setPageNumber] = useState(1);

  let data = [];
  const totalCount = 0;

  return (
    <FeatureFlag isFeatureEnabled={featureFlags.quickCreateOrganization}>
      <Main>
        <h4 className="events-heading">{t('dashboard.events.heading')}</h4>
        <AddOrganization label={t('dashboard.events.addEvent')} />
        <OrganizationSearch
          placeholder={t('dashboard.events.searchPlaceholder')}
          //   onPressEnter={(e) => onSearchHandler(e)}
          //   defaultValue={eventSearchQuery}
          allowClear={true}
          //   onChange={onChangeHandler}
        />
        <Sort />
        <div>filter</div>
        {data?.length > 0 ? (
          <List
            className="event-list-wrapper"
            itemLayout={screens.xs ? 'vertical' : 'horizontal'}
            dataSource={data?.data}
            bordered={false}
            pagination={{
              onChange: (page) => {
                setPageNumber(page);
              },
              pageSize: 10,
              hideOnSinglePage: true,
              total: totalCount,
              current: Number(pageNumber),
              showSizeChanger: false,
            }}
            renderItem={(item, index) => <ListItem item={item} key={index} id={index} />}
          />
        ) : (
          <NoContent style={{ height: '200px' }} />
        )}
      </Main>
    </FeatureFlag>
  );
}

export default Organizations;
