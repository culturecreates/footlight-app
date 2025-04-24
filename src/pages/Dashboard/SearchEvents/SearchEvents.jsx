import { Popover } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import CreateEntityButton from '../../../components/Card/Common/CreateEntityButton';
import EntityCard from '../../../components/Card/Common/EntityCard';
import NoContent from '../../../components/NoContent/NoContent';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import { PathName } from '../../../constants/pathName';
import NewEntityLayout from '../../../layout/CreateNewEntity/NewEntityLayout';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { EnvironmentOutlined } from '@ant-design/icons';
// import './searchPlaces.css';
import { entitiesClass } from '../../../constants/entitiesClass';
import { useGetEntitiesQuery, useLazyGetEntitiesQuery } from '../../../services/entities';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { useGetExternalSourceQuery, useLazyGetExternalSourceQuery } from '../../../services/externalSource';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { externalSourceOptions } from '../../../constants/sourceOptions';

function SearchEvents() {
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
  const [eventsList, setEventsList] = useState([]);
  const [eventListExternalSource, setEventListExternalSource] = useState([]);

  const [selectedEvents, setSelectedEvents] = useState([]);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');

  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery();
  const [getExternalSource, { isFetching: isExternalSourceFetching }] = useLazyGetExternalSourceQuery();

  let query = new URLSearchParams();
  query.append('classes', entitiesClass.event);
  const { currentData: initialEntities, isFetching: initialEventsLoading } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    sessionId: timestampRef,
    includeArtsdata: true,
  });

  let sourceQuery = new URLSearchParams();
  sourceQuery.append('sources', externalSourceOptions.ARTSDATA);
  const { currentData: initialExternalSource, isFetching: initialExternalSourceLoading } = useGetExternalSourceQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    sources: decodeURIComponent(sourceQuery.toString()),
    sessionId: timestampRef,
  });

  useEffect(() => {
    if (initialEntities && currentCalendarData && initialExternalSourceLoading) {
      setEventsList(initialEntities);
      setEventListExternalSource(initialExternalSource ?? []);
    }
  }, [initialEventsLoading]);

  // handlers

  const artsDataClickHandler = async (entity) => {
    navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}${PathName.AddEvent}`, { state: { data: entity } });
  };

  const searchHandler = (value) => {
    getEntities({ searchKey: value, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        setEventsList(response);
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
        setEventListExternalSource(response ?? []);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (isReadOnly) {
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`, { replace: true });
    }
  }, [isReadOnly]);

  const debounceSearch = useCallback(useDebounce(searchHandler, SEARCH_DELAY), []);

  return (
    !initialEventsLoading && (
      <NewEntityLayout
        heading={t('dashboard.events.createNew.search.title')}
        entityName={t('dashboard.events.createNew.search.searchbarHeader')}
        text={t('dashboard.events.createNew.search.text')}>
        <div className="search-bar-places">
          <Popover
            data-cy="popover-events-search"
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
                <div className="popover-section-header" data-cy="div-event-footlight-title">
                  {t('dashboard.events.createNew.search.footlightSectionHeading')}
                </div>
                <div className="search-scrollable-content">
                  {isEntitiesFetching && (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LoadingIndicator />
                    </div>
                  )}
                  {!isEntitiesFetching &&
                    (eventsList?.length > 0 ? (
                      eventsList?.map((event, index) => (
                        <div
                          key={index}
                          className="search-popover-options"
                          onClick={() => {
                            setSelectedEvents([...selectedEvents, event]);
                            setIsPopoverOpen(false);
                          }}
                          data-cy={`div-event-  footlight-${index}`}>
                          <EntityCard
                            title={contentLanguageBilingual({
                              data: event?.name,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                            description={contentLanguageBilingual({
                              data: event?.disambiguatingDescription,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                            artsDataLink={artsDataLinkChecker(event?.uri)}
                            Logo={
                              event.logo ? (
                                event.logo?.thumbnail?.uri
                              ) : (
                                <EnvironmentOutlined style={{ color: '#607EFC', fontSize: '18px' }} />
                              )
                            }
                            linkText={t('dashboard.events.createNew.search.linkText')}
                            onClick={() => {
                              if (routinghandler(user, calendarId, event?.creator?.userId, null, true)) {
                                navigate(
                                  `${PathName.Dashboard}/${calendarId}${PathName.Events}${PathName.AddEvent}/${event?.id}`,
                                );
                              } else navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}/${event?.id}`);
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <NoContent />
                    ))}
                </div>

                {quickCreateKeyword.length > 0 && (
                  <>
                    <div className="popover-section-header" data-cy="div-event-artsdata-title">
                      {t('dashboard.events.createNew.search.artsDataSectionHeading')}
                    </div>
                    <div className="search-scrollable-content">
                      {isExternalSourceFetching && (
                        <div
                          style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LoadingIndicator />
                        </div>
                      )}
                      {!isExternalSourceFetching &&
                        (eventListExternalSource?.artsdata?.length > 0 ? (
                          eventListExternalSource?.artsdata?.map((event, index) => (
                            <div
                              key={index}
                              className="search-popover-options"
                              onClick={() => {
                                setIsPopoverOpen(false);
                              }}
                              data-cy={`div-event-artsdata-${index}`}>
                              <EntityCard
                                title={contentLanguageBilingual({
                                  data: event?.name,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                  calendarContentLanguage: calendarContentLanguage,
                                })}
                                description={event?.description}
                                artsDataLink={event?.uri}
                                Logo={
                                  event.logo ? (
                                    event.logo?.thumbnail?.uri
                                  ) : (
                                    <EnvironmentOutlined style={{ color: '#607EFC', fontSize: '18px' }} />
                                  )
                                }
                                linkText={t('dashboard.events.createNew.search.linkText')}
                                onClick={() => artsDataClickHandler(event)}
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
                      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}${PathName.AddEvent}`, {
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
              data-cy="input-event-search"
              style={{ borderRadius: '4px' }}
              placeholder={t('dashboard.events.createNew.search.searchPlaceholder')}
              autoFocus={true}
              onClick={(e) => {
                setQuickCreateKeyword(e.target.value);
                setIsPopoverOpen(true);
              }}
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

export default SearchEvents;
