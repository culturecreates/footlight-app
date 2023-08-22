import { Popover } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import EntityCard from '../../../components/Card/Common/EntityCard';
import NoContent from '../../../components/NoContent/NoContent';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import NewEntityLayout from '../../../layout/CreateNewEntity/NewEntityLayout';
import { entitiesClass } from '../../../constants/entitiesClass';
import { ReactComponent as Logo } from '../../../assets/icons/organization-light.svg';
import { useTranslation } from 'react-i18next';
import './searchOrganizations.css';
import { useGetEntitiesQuery, useLazyGetEntitiesQuery } from '../../../services/entities';
import { useOutletContext, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import CreateOrganizationButton from '../../../components/Card/Common/CreateOrganizationButton';

function SearchOrganizations() {
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);
  const [currentCalendarData] = useOutletContext();

  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [organizationList, setOrganizationList] = useState([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');

  const [getEntities] = useLazyGetEntitiesQuery({ sessionId: timestampRef });

  let query = new URLSearchParams();
  query.append('classes', entitiesClass.organization);
  const { currentData: initialEntities, isLoading: initialOrganizersLoading } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    sessionId: timestampRef,
  });

  // effects

  useEffect(() => {
    if (initialEntities && currentCalendarData) {
      setOrganizationList(initialEntities);
    }
    console.log(initialOrganizersLoading, 'asd');
  }, [initialOrganizersLoading]);

  // handlers

  const searchHandler = (value) => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.organization);
    getEntities({ searchKey: value, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        setOrganizationList(response);
      })
      .catch((error) => console.log(error));
  };

  return (
    !initialOrganizersLoading && (
      <NewEntityLayout
        heading={t('dashboard.organization.createNew.search.title')}
        entityName={t('dashboard.organization.createNew.search.searchbarHeader')}
        text={t('dashboard.organization.createNew.search.text')}>
        <div className="search-bar-organization">
          <Popover
            open={isPopoverOpen}
            arrow={false}
            overlayClassName="event-popover"
            placement="bottom"
            onOpenChange={(open) => setIsPopoverOpen(open)}
            autoAdjustOverflow={false}
            getPopupContainer={(trigger) => trigger.parentNode}
            trigger={['click']}
            content={
              <div>
                <div className="search-scrollable-content">
                  {organizationList?.length > 0 ? (
                    organizationList?.map((organizer, index) => (
                      <div
                        key={index}
                        className="search-popover-options"
                        onClick={() => {
                          setSelectedOrganizers([...selectedOrganizers, organizer]);
                          setIsPopoverOpen(false);
                        }}>
                        <EntityCard
                          title={contentLanguageBilingual({
                            en: organizer?.name?.en,
                            fr: organizer?.name?.fr,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            calendarContentLanguage: calendarContentLanguage,
                          })}
                          description={contentLanguageBilingual({
                            en: organizer?.disambiguatingDescription?.en,
                            fr: organizer?.disambiguatingDescription?.fr,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            calendarContentLanguage: calendarContentLanguage,
                          })}
                          artsDataLink={artsDataLinkChecker(organizer?.uri)}
                          Logo={Logo}
                          linkText={t('dashboard.organization.createNew.search.linkText')}
                        />
                      </div>
                    ))
                  ) : (
                    <NoContent />
                  )}
                </div>
                {quickCreateKeyword?.length > 0 && <CreateOrganizationButton quickCreateKeyword={quickCreateKeyword} />}
              </div>
            }>
            <EventsSearch
              style={{ borderRadius: '4px' }}
              placeholder="Search organizations"
              onClick={(e) => {
                setQuickCreateKeyword(e.target.value);
                setIsPopoverOpen(true);
              }}
              onChange={(e) => {
                setQuickCreateKeyword(e.target.value);
                searchHandler(e.target.value);
                setIsPopoverOpen(true);
              }}
            />
          </Popover>
        </div>
      </NewEntityLayout>
    )
  );
}

export default SearchOrganizations;
