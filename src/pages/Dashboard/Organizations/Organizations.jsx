import React from 'react';
import './organizations.css';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import Main from '../../../layout/Main/Main';
import OrganizationSearch from '../../../components/Search/Events/EventsSearch';
import AddOrganization from '../../../components/Button/AddEvent';
import Sort from '../../../components/Sort/Sort';

function Organizations() {
  const { t } = useTranslation();

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
      </Main>
    </FeatureFlag>
  );
}

export default Organizations;
