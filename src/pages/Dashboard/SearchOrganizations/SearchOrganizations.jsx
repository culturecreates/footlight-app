import React, { useEffect, useState, useRef, useCallback } from 'react';
import EntityCard from '../../../components/Card/Common/EntityCard';
import NoContent from '../../../components/NoContent/NoContent';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import NewEntityLayout from '../../../layout/CreateNewEntity/NewEntityLayout';
import { entitiesClass } from '../../../constants/entitiesClass';
import Logo from '../../../assets/icons/organization-light.svg?react';
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
import { Popover } from 'antd';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { useGetExternalSourceQuery, useLazyGetExternalSourceQuery } from '../../../services/externalSource';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { externalSourceOptions } from '../../../constants/sourceOptions';

function SearchOrganizations() {
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
    isReadOnly,
  ] = useOutletContext();
  setContentBackgroundColor('#F9FAFF');
  const navigate = useNavigate();

  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [organizationList, setOrganizationList] = useState([]);
  const [organizationListExternalSource, setOrganizationListExternalSource] = useState([]);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');

  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery();
  const [getExternalSource, { isFetching: isExternalSourceFetching }] = useLazyGetExternalSourceQuery();

  let query = new URLSearchParams();
  query.append('classes', entitiesClass.organization);
  const { currentData: initialEntities, isLoading: initialOrganizersLoading } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    includeArtsdata: true,
    sessionId: timestampRef,
  });

  let sourceQuery = new URLSearchParams();
  sourceQuery.append('sources', externalSourceOptions.ARTSDATA);
  sourceQuery.append('sources', externalSourceOptions.FOOTLIGHT);

  const { currentData: initialExternalSource, isFetching: initialExternalSourceLoading } = useGetExternalSourceQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    sources: decodeURIComponent(sourceQuery.toString()),
    sessionId: timestampRef,
  });

  // effects

  useEffect(() => {
    if (initialEntities && currentCalendarData && initialExternalSourceLoading) {
      setOrganizationList(initialEntities);
      setOrganizationListExternalSource(initialExternalSource);
    }
  }, [initialOrganizersLoading]);

  // handlers

  const artsDataClickHandler = async (entity) => {
    navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}`, {
      state: { data: entity },
    });
  };

  const searchHandler = (value) => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.organization);
    getEntities({ searchKey: value, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        setOrganizationList(response);
      })
      .catch((error) => console.log(error));
    getExternalSource({
      searchKey: value,
      classes: decodeURIComponent(query.toString()),
      sources: decodeURIComponent(sourceQuery.toString()),
      calendarId,
      excludeExistingCMS: true,
    })
      .unwrap()
      .then((response) => {
        setOrganizationListExternalSource(response);
      })
      .catch((error) => console.log(error));
  };
  useEffect(() => {
    if (isReadOnly) {
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}`, { replace: true });
    }
  }, [isReadOnly]);

  const debounceSearch = useCallback(useDebounce(searchHandler, SEARCH_DELAY), []);

  return (
    !initialOrganizersLoading && (
      <NewEntityLayout
        heading={t('dashboard.organization.createNew.search.title')}
        entityName={t('dashboard.organization.createNew.search.searchbarHeader')}
        text={t('dashboard.organization.createNew.search.text')}>
        <div className="search-bar-organization">
          <Popover
            data-cy="popover-organization-entity-search"
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
                <div className="popover-section-header" data-cy="footlight-entity-title">
                  {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                </div>
                <div className="search-scrollable-content">
                  {isEntitiesFetching && (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LoadingIndicator />
                    </div>
                  )}
                  {!isEntitiesFetching &&
                    (organizationList?.length > 0 ? (
                      organizationList?.map((organizer, index) => (
                        <div
                          key={index}
                          className="search-popover-options"
                          onClick={() => {
                            setIsPopoverOpen(false);
                          }}
                          data-cy={`div-organization-footlight-${index}`}>
                          <EntityCard
                            title={contentLanguageBilingual({
                              data: organizer?.name,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                            description={contentLanguageBilingual({
                              data: organizer?.disambiguatingDescription,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                            artsDataLink={artsDataLinkChecker(organizer?.uri)}
                            Logo={
                              organizer.logo ? (
                                <img src={organizer.logo?.thumbnail?.uri} data-cy={`img-entity-logo-${index}`} />
                              ) : (
                                <Logo />
                              )
                            }
                            linkText={t('dashboard.organization.createNew.search.linkText')}
                            onClick={() => {
                              if (routinghandler(user, calendarId, organizer?.creator?.userId, null, true)) {
                                navigate(
                                  `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}?id=${organizer?.id}`,
                                );
                              } else
                                navigate(
                                  `${PathName.Dashboard}/${calendarId}${PathName.Organizations}/${organizer?.id}`,
                                );
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <NoContent />
                    ))}
                </div>

                {quickCreateKeyword !== '' && (
                  <>
                    <div className="popover-section-header" data-cy="organization-artsdata-heading">
                      {t('dashboard.organization.createNew.search.importsFromFootlight')}
                    </div>
                    <div className="search-scrollable-content">
                      {isExternalSourceFetching && (
                        <div
                          style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LoadingIndicator />
                        </div>
                      )}
                      {!isExternalSourceFetching &&
                        (organizationListExternalSource?.footlight?.length > 0 ? (
                          organizationListExternalSource?.footlight?.map((organizer, index) => (
                            <div
                              key={index}
                              className="search-popover-options"
                              onClick={() => {
                                setIsPopoverOpen(false);
                              }}
                              data-cy={`div-organization-footlight-${index}`}>
                              <EntityCard
                                title={contentLanguageBilingual({
                                  data: organizer?.name,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                  calendarContentLanguage: calendarContentLanguage,
                                })}
                                description={contentLanguageBilingual({
                                  data: organizer?.disambiguatingDescription,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                  calendarContentLanguage: calendarContentLanguage,
                                })}
                                artsDataLink={artsDataLinkChecker(organizer?.uri)}
                                Logo={
                                  organizer.logo ? (
                                    <img src={organizer.logo?.thumbnail?.uri} data-cy={`img-entity-logo-${index}`} />
                                  ) : (
                                    <Logo />
                                  )
                                }
                                linkText={t('dashboard.organization.createNew.search.linkText')}
                                onClick={() =>
                                  navigate(
                                    `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}?entityId=${organizer?.id}`,
                                  )
                                }
                              />
                            </div>
                          ))
                        ) : (
                          <NoContent />
                        ))}
                    </div>
                  </>
                )}
                {quickCreateKeyword !== '' && (
                  <>
                    <div className="popover-section-header" data-cy="organization-artsdata-heading">
                      {t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                    </div>
                    <div className="search-scrollable-content">
                      {isExternalSourceFetching && (
                        <div
                          style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LoadingIndicator />
                        </div>
                      )}
                      {!isExternalSourceFetching &&
                        (organizationListExternalSource?.artsdata?.length > 0 ? (
                          organizationListExternalSource?.artsdata?.map((organizer, index) => (
                            <div
                              key={index}
                              className="search-popover-options"
                              data-cy={`div-orgnanization--artsdata-entity-${index}`}
                              onClick={() => {
                                setIsPopoverOpen(false);
                              }}>
                              <EntityCard
                                title={contentLanguageBilingual({
                                  data: organizer?.name,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                  calendarContentLanguage: calendarContentLanguage,
                                })}
                                description={organizer?.description}
                                artsDataLink={organizer?.uri}
                                Logo={organizer.logo ? <img src={organizer?.logo?.thumbnail?.uri} /> : <Logo />}
                                linkText={t('dashboard.organization.createNew.search.linkText')}
                                onClick={() => artsDataClickHandler(organizer)}
                              />
                            </div>
                          ))
                        ) : (
                          <NoContent />
                        ))}
                    </div>
                  </>
                )}

                {quickCreateKeyword?.length > 0 && (
                  <CreateEntityButton
                    quickCreateKeyword={quickCreateKeyword}
                    onClick={() => {
                      navigate(
                        `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}`,
                        { state: { name: quickCreateKeyword } },
                      );
                    }}
                  />
                )}
              </div>
            }>
            <EventsSearch
              data-cy="input-search-organization"
              style={{ borderRadius: '4px' }}
              placeholder="Search organizations"
              onClick={(e) => {
                setQuickCreateKeyword(e.target.value);
                setIsPopoverOpen(true);
              }}
              autoFocus={true}
              onChange={(e) => {
                setQuickCreateKeyword(e.target.value);
                debounceSearch(e.target.value);
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
