import { Popover } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import CreateEntityButton from '../../../components/Card/Common/CreateEntityButton';
import EntityCard from '../../../components/Card/Common/EntityCard';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import { entitiesClass } from '../../../constants/entitiesClass';
import { PathName } from '../../../constants/pathName';
import NewEntityLayout from '../../../layout/CreateNewEntity/NewEntityLayout';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useGetEntitiesQuery, useLazyGetEntitiesQuery } from '../../../services/entities';
import { createArtsDataLink, isArtsdataUri } from '../../../utils/artsDataLinkChecker';
import { UserOutlined } from '@ant-design/icons';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import './searchPerson.css';
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

function SearchPerson() {
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
  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const timestampRef = useRef(Date.now()).current;
  const activePromiseRef = useRef(null);

  useAbortControllersOnUnmount([activePromiseRef]);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [peopleList, setPeopleList] = useState([]);
  const [peopleListExternalSource, setPeopleListExternalSource] = useState([]);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');

  const [entitiesError, setEntitiesError] = useState(false);
  const [externalSourceError, setExternalSourceError] = useState(false);

  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery();
  const [getExternalSource, { isFetching: isExternalSourceFetching }] = useLazyGetExternalSourceQuery();

  let query = new URLSearchParams();
  query.append('classes', entitiesClass.person);

  const importProviderConfig = getImportProviderConfig(importProviderContexts.SEARCH_PEOPLE);
  const sourceQuery = getExternalSourcesQuery(importProviderContexts.SEARCH_PEOPLE);
  const showFootlightImportSection = importProviderConfig.showFootlightImportSection;

  const {
    currentData: initialEntities,
    isFetching: initialPersonLoading,
    isError: isInitialPersonError,
  } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    sessionId: timestampRef,
  });

  // effects

  useEffect(() => {
    if (initialEntities && currentCalendarData) {
      setPeopleList(initialEntities);
    }
  }, [initialPersonLoading]);

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
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.AddPerson}`, {
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
      setPeopleListExternalSource(data ?? []);
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
    query.append('classes', entitiesClass.person);
    getEntities({ searchKey: value, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        setPeopleList(response);
      })
      .catch((error) => {
        setEntitiesError(true);
        console.log(error);
      });
  };

  useEffect(() => {
    if (isReadOnly) {
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}`, { replace: true });
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
      {peopleList?.length > 0 && (
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          {t('dashboard.events.createNew.search.footlightResultsStillAvailable')}
        </div>
      )}
    </div>
  );

  const renderPersonCard = ({ person, description, onClick }) => (
    <EntityCard
      title={contentLanguageBilingual({
        data: person?.name,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        calendarContentLanguage: calendarContentLanguage,
      })}
      description={description}
      artsDataLink={createArtsDataLink(person?.uri)}
      Logo={person.logo ? person.logo?.thumbnail?.uri : <UserOutlined style={{ color: '#607EFC', fontSize: '18px' }} />}
      linkText={
        isArtsdataUri(person?.uri)
          ? t('dashboard.events.createNew.search.linkText')
          : t('dashboard.events.createNew.search.datafeed')
      }
      onClick={onClick}
    />
  );

  return !initialPersonLoading || isInitialPersonError ? (
    <NewEntityLayout
      heading={t('dashboard.people.createNew.search.title')}
      text={t('dashboard.people.createNew.search.text')}
      searchHeading={t('dashboard.people.createNew.search.searchHeading')}>
      <div className="search-bar-person">
        <Popover
          open={isPopoverOpen}
          arrow={false}
          data-cy="popover-person-search"
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
                title={t('dashboard.people.createNew.search.footlightSectionHeading')}
                headerDataCy="div-person-footlight-title"
                isLoading={isEntitiesFetching}
                hasError={entitiesError}
                errorNode={localSearchErrorNode}
                items={peopleList}
                itemDataCy={(index) => `div-person-footlight-${index}`}
                onSelect={() => {
                  setIsPopoverOpen(false);
                }}
                renderItem={(person) =>
                  renderPersonCard({
                    person,
                    description: contentLanguageBilingual({
                      data: person?.disambiguatingDescription,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    }),
                    onClick: () => {
                      if (routinghandler(user, calendarId, person?.creator?.userId, null, true)) {
                        navigate(
                          `${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.AddPerson}?id=${person?.id}`,
                        );
                      } else {
                        navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}/${person?.id}`);
                      }
                    },
                  })
                }
              />
              {showFootlightImportSection && quickCreateKeyword.length > 0 && (
                <EntityPopoverSection
                  title={t('dashboard.people.createNew.search.importsFromFootlight')}
                  headerDataCy="div-person-artsdata-title"
                  isLoading={isExternalSourceFetching}
                  hasError={externalSourceError}
                  errorNode={externalSearchErrorNode}
                  items={peopleListExternalSource?.footlight}
                  itemDataCy={(index) => `div-person-artsdata-${index}`}
                  onSelect={() => {
                    setIsPopoverOpen(false);
                  }}
                  renderItem={(person) =>
                    renderPersonCard({
                      person,
                      description: contentLanguageBilingual({
                        data: person?.disambiguatingDescription,
                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                        calendarContentLanguage: calendarContentLanguage,
                      }),
                      onClick: () => {
                        const fn = () => {
                          navigate(
                            `${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.AddPerson}?entityId=${person?.id}`,
                            {
                              state: { data: { footlightId: person?.footlightId } },
                            },
                          );
                        };
                        confirmPopupHandler(fn, person);
                      },
                    })
                  }
                />
              )}
              {quickCreateKeyword.length > 0 && (
                <EntityPopoverSection
                  title={t('dashboard.people.createNew.search.artsDataSectionHeading')}
                  headerDataCy="div-person-artsdata-title"
                  isLoading={isExternalSourceFetching}
                  hasError={externalSourceError}
                  errorNode={externalSearchErrorNode}
                  items={peopleListExternalSource?.artsdata}
                  itemDataCy={(index) => `div-person-artsdata-${index}`}
                  onSelect={() => {
                    setIsPopoverOpen(false);
                  }}
                  renderItem={(person) =>
                    renderPersonCard({
                      person,
                      description: person?.description,
                      onClick: () => artsDataClickHandler(person),
                    })
                  }
                />
              )}

              {quickCreateKeyword?.length > 0 && (
                <CreateEntityButton
                  quickCreateKeyword={quickCreateKeyword}
                  onClick={() => {
                    navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.AddPerson}`, {
                      state: {
                        name: quickCreateKeyword,
                      },
                    });
                  }}
                />
              )}
            </div>
          }>
          <EventsSearch
            data-cy="input-person-search"
            style={{ borderRadius: '4px' }}
            placeholder={t('dashboard.people.createNew.search.searchPlaceholder')}
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

export default SearchPerson;
