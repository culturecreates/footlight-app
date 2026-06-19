import React, { useEffect, useState, useRef, useCallback } from 'react';
import EntityCard from '../../../components/Card/Common/EntityCard';
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
import { createArtsDataLink, isArtsdataUri } from '../../../utils/artsDataLinkChecker';
import CreateEntityButton from '../../../components/Card/Common/CreateEntityButton';
import { PathName } from '../../../constants/pathName';
import { Popover } from 'antd';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { useLazyGetExternalSourceQuery } from '../../../services/externalSource';
import LoadingIndicator from '../../../components/LoadingIndicator';
import EntityPopoverSection from '../../../components/EntityImport/EntityPopoverSection';
import {
  getExternalSourcesQuery,
  getImportProviderConfig,
  importProviderContexts,
} from '../../../constants/importProviders';
import useAbortControllersOnUnmount from '../../../hooks/useAbortControllersOnUnmount';
import { CustomModal } from '../../../components/Modal/HookModal/Modal';

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

  useEffect(() => {
    setContentBackgroundColor('#F9FAFF');
  }, [setContentBackgroundColor]);

  const navigate = useNavigate();

  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const activePromiseRef = useRef(null);

  useAbortControllersOnUnmount([activePromiseRef]);

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [organizationList, setOrganizationList] = useState([]);
  const [organizationListExternalSource, setOrganizationListExternalSource] = useState([]);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');

  const [entitiesError, setEntitiesError] = useState(false);
  const [externalSourceError, setExternalSourceError] = useState(false);

  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery();
  const [getExternalSource, { isFetching: isExternalSourceFetching }] = useLazyGetExternalSourceQuery();

  let query = new URLSearchParams();
  query.append('classes', entitiesClass.organization);
  const {
    currentData: initialEntities,
    isLoading: initialOrganizersLoading,
    isError: isInitialOrganizersError,
  } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    includeArtsdata: true,
    sessionId: timestampRef,
  });

  const importProviderConfig = getImportProviderConfig(importProviderContexts.SEARCH_ORGANIZATIONS);
  const sourceQuery = getExternalSourcesQuery(importProviderContexts.SEARCH_ORGANIZATIONS);
  const showFootlightImportSection = importProviderConfig.showFootlightImportSection;

  // effects

  useEffect(() => {
    if (initialEntities && currentCalendarData) {
      setOrganizationList(initialEntities);
    }
  }, [initialOrganizersLoading]);

  // handlers

  const confirmPopupHandler = (fn, entity) => {
    if (entity?.footlightId) {
      CustomModal({
        title: t('dashboard.events.createNew.search.confirm.title'),
        content: t('dashboard.events.createNew.search.confirm.content'),
        primaryButtonText: t('dashboard.events.createNew.search.confirm.editText'),
        secondaryButtonText: t('dashboard.events.createNew.search.confirm.okText'),
        cancelText: t('dashboard.events.createNew.search.confirm.cancelText'),
        className: 'existing-entity-found-info-modal',
        secondaryAction: () => fn(),
        primaryAction: () => {
          navigate(
            `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}?id=${entity?.footlightId}`,
          );
        },
      });
    } else {
      fn();
    }
  };

  const artsDataClickHandler = async (entity) => {
    const handleImport = () => {
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}`, {
        state: { data: entity },
      });
    };
    confirmPopupHandler(handleImport, entity);
  };

  const searchExternalSourceHandler = async (value) => {
    setExternalSourceError(false);
    if (activePromiseRef.current) {
      activePromiseRef.current.abort();
    }

    const promise = getExternalSource({
      searchKey: value,
      classes: decodeURIComponent(query.toString()),
      sources: sourceQuery,
      calendarId,
      excludeExistingCMS: false,
    });

    activePromiseRef.current = promise;

    try {
      const data = await promise.unwrap();
      setOrganizationListExternalSource(data ?? []);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setExternalSourceError(true);
      }
      console.log(e);
    }
  };

  const entitiesSearchHandler = (value) => {
    setEntitiesError(false);
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.organization);
    getEntities({ searchKey: value, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        setOrganizationList(response);
      })
      .catch((error) => {
        setEntitiesError(true);
        console.log(error);
      });
  };

  useEffect(() => {
    if (isReadOnly) {
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}`, { replace: true });
    }
  }, [isReadOnly]);

  const debounceEntitiesSearch = useCallback(useDebounce(entitiesSearchHandler, SEARCH_DELAY), []);
  const debounceExternalSourceSearch = useCallback(useDebounce(searchExternalSourceHandler, SEARCH_DELAY), [
    getExternalSource,
  ]);

  const localSearchErrorNode = (
    <div style={{ padding: '20px', textAlign: 'center', color: '#ff4d4f' }}>
      {t('dashboard.events.createNew.search.footlightTemporarilyUnavailable', {
        defaultValue: 'Footlight search is temporarily unavailable',
      })}
    </div>
  );

  const externalSearchErrorNode = (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ color: '#ff4d4f' }}>{t('dashboard.events.createNew.search.artsdataTemporarilyUnavailable')}</div>
      {organizationList?.length > 0 && (
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          {t('dashboard.events.createNew.search.footlightResultsStillAvailable')}
        </div>
      )}
    </div>
  );

  const renderOrganizationCard = ({ organizer, description, onClick, index }) => (
    <EntityCard
      title={contentLanguageBilingual({
        data: organizer?.name,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        calendarContentLanguage: calendarContentLanguage,
      })}
      description={description}
      artsDataLink={createArtsDataLink(organizer?.uri)}
      isTransparent={organizer?.logo?.isTransparent ?? false}
      Logo={
        organizer.logo ? <img src={organizer.logo?.thumbnail?.uri} data-cy={`img-entity-logo-${index}`} /> : <Logo />
      }
      linkText={
        isArtsdataUri(organizer?.uri)
          ? t('dashboard.events.createNew.search.linkText')
          : t('dashboard.events.createNew.search.datafeed')
      }
      onClick={onClick}
    />
  );

  return !initialOrganizersLoading || isInitialOrganizersError ? (
    <NewEntityLayout
      heading={t('dashboard.organization.createNew.search.title')}
      text={t('dashboard.organization.createNew.search.text')}
      searchHeading={t('dashboard.organization.createNew.search.searchHeading')}>
      <div className="search-bar-organization">
        <Popover
          data-cy="popover-organization-entity-search"
          open={isPopoverOpen}
          arrow={false}
          overlayClassName="entity-popover"
          placement="bottom"
          onOpenChange={(open) => {
            setIsPopoverOpen(open);
            debounceEntitiesSearch(quickCreateKeyword);
          }}
          autoAdjustOverflow={false}
          getPopupContainer={(trigger) => trigger.parentNode}
          trigger={['click']}
          content={
            <div>
              <EntityPopoverSection
                title={t('dashboard.organization.createNew.search.footlightSectionHeading')}
                headerDataCy="footlight-entity-title"
                isLoading={isEntitiesFetching}
                hasError={entitiesError}
                errorNode={localSearchErrorNode}
                items={organizationList}
                itemDataCy={(index) => `div-organization-footlight-${index}`}
                onSelect={() => {
                  setIsPopoverOpen(false);
                }}
                renderItem={(organizer, index) =>
                  renderOrganizationCard({
                    organizer,
                    description: contentLanguageBilingual({
                      data: organizer?.disambiguatingDescription,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    }),
                    onClick: () => {
                      if (routinghandler(user, calendarId, organizer?.creator?.userId, null, true)) {
                        navigate(
                          `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}?id=${organizer?.id}`,
                        );
                      } else {
                        navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}/${organizer?.id}`);
                      }
                    },
                    index,
                  })
                }
              />

              {showFootlightImportSection && quickCreateKeyword !== '' && (
                <EntityPopoverSection
                  title={t('dashboard.organization.createNew.search.importsFromFootlight')}
                  headerDataCy="organization-artsdata-heading"
                  isLoading={isExternalSourceFetching}
                  hasError={externalSourceError}
                  errorNode={externalSearchErrorNode}
                  items={organizationListExternalSource?.footlight}
                  itemDataCy={(index) => `div-organization-footlight-${index}`}
                  onSelect={() => {
                    setIsPopoverOpen(false);
                  }}
                  renderItem={(organizer, index) =>
                    renderOrganizationCard({
                      organizer,
                      description: contentLanguageBilingual({
                        data: organizer?.disambiguatingDescription,
                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                        calendarContentLanguage: calendarContentLanguage,
                      }),
                      onClick: () => {
                        const fn = () => {
                          navigate(
                            `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}?entityId=${organizer?.id}`,
                            { state: { data: { footlightId: organizer?.footlightId } } },
                          );
                        };
                        confirmPopupHandler(fn, organizer);
                      },
                      index,
                    })
                  }
                />
              )}
              {quickCreateKeyword !== '' && (
                <EntityPopoverSection
                  title={t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                  headerDataCy="organization-artsdata-heading"
                  isLoading={isExternalSourceFetching}
                  hasError={externalSourceError}
                  errorNode={externalSearchErrorNode}
                  items={organizationListExternalSource?.artsdata}
                  itemDataCy={(index) => `div-orgnanization--artsdata-entity-${index}`}
                  onSelect={() => {
                    setIsPopoverOpen(false);
                  }}
                  renderItem={(organizer) =>
                    renderOrganizationCard({
                      organizer,
                      description: organizer?.description,
                      onClick: () => artsDataClickHandler(organizer),
                    })
                  }
                />
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
            placeholder={t('dashboard.organization.createNew.search.searchPlaceholder')}
            onClick={(e) => {
              setQuickCreateKeyword(e.target.value);
              setIsPopoverOpen(true);
            }}
            autoFocus={true}
            onChange={(e) => {
              setQuickCreateKeyword(e.target.value);
              debounceEntitiesSearch(e.target.value);
              if (e.target.value !== '') {
                debounceExternalSourceSearch(e.target.value);
              }
              setIsPopoverOpen(true);
            }}
          />
        </Popover>
      </div>
    </NewEntityLayout>
  ) : (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <LoadingIndicator />
    </div>
  );
}

export default SearchOrganizations;
