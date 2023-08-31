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
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import CreateEntityButton from '../../../components/Card/Common/CreateEntityButton';
import { PathName } from '../../../constants/pathName';
import { useLazyGetArtsDataEntityQuery } from '../../../services/artsData';

function SearchOrganizations() {
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);
  const [currentCalendarData] = useOutletContext();
  const navigate = useNavigate();

  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [organizationList, setOrganizationList] = useState([]);
  const [organizationListArtsData, setOrganizationListArtsData] = useState([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');

  const [getEntities] = useLazyGetEntitiesQuery({ sessionId: timestampRef });
  const [getArtsDataEntity] = useLazyGetArtsDataEntityQuery({ sessionId: timestampRef });

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

    getArtsDataEntity({ searchKeyword: value, entityType: entitiesClass.organization })
      .unwrap()
      .then((response) => {
        setOrganizationListArtsData(response?.result);
        console.log(organizationListArtsData);
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
            overlayClassName="entity-popover"
            placement="bottom"
            onOpenChange={(open) => {
              setIsPopoverOpen(open);
              searchHandler(quickCreateKeyword);
            }}
            autoAdjustOverflow={false}
            getPopupContainer={(trigger) => trigger.parentNode}
            trigger={['click']}
            content={
              <div>
                <div className="popover-section-header">
                  {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                </div>
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
                          Logo={organizer.logo ? <img src={organizer.logo?.thumbnail?.uri} /> : <Logo />}
                          linkText={t('dashboard.organization.createNew.search.linkText')}
                          onClick={() =>
                            navigate(
                              `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}?id=${organizer?.id}`,
                            )
                          }
                        />
                      </div>
                    ))
                  ) : (
                    <NoContent />
                  )}
                </div>
                {quickCreateKeyword !== '' && (
                  <>
                    <div className="popover-section-header">
                      {t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                    </div>
                    <div className="search-scrollable-content">
                      {organizationListArtsData?.length > 0 ? (
                        organizationListArtsData?.map((organizer, index) => (
                          <div
                            key={index}
                            className="search-popover-options"
                            onClick={() => {
                              setSelectedOrganizers([...selectedOrganizers, organizer]);
                              setIsPopoverOpen(false);
                            }}>
                            <EntityCard
                              title={organizer?.name}
                              description={organizer?.description}
                              artsDataLink={`${process.env.REACT_APP_ARTS_DATA_URI}${organizer?.id}`}
                              Logo={organizer.logo ? <img src={organizer?.logo?.thumbnail?.uri} /> : <Logo />}
                              linkText={t('dashboard.organization.createNew.search.linkText')}
                              onClick={() =>
                                navigate(
                                  `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}?id=${organizer?.id}`,
                                )
                              }
                            />
                          </div>
                        ))
                      ) : (
                        <NoContent />
                      )}
                    </div>
                  </>
                )}
                {quickCreateKeyword?.length > 0 && (
                  <CreateEntityButton
                    quickCreateKeyword={quickCreateKeyword}
                    onClick={() => {
                      navigate(
                        `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}`,
                        { name: quickCreateKeyword },
                      );
                    }}
                  />
                )}
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
