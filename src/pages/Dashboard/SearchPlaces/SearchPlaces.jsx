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
import './searchPlaces.css';
import { entitiesClass } from '../../../constants/entitiesClass';
import { useGetEntitiesQuery, useLazyGetEntitiesQuery } from '../../../services/entities';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { useGetExternalSourceQuery, useLazyGetExternalSourceQuery } from '../../../services/externalSource';
import LoadingIndicator from '../../../components/LoadingIndicator';

function SearchPlaces() {
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);
  const [currentCalendarData] = useOutletContext();
  const navigate = useNavigate();

  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [placesList, setPlacesList] = useState([]);
  const [placesListArtsData, setPlacesListArtsData] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');

  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery({ sessionId: timestampRef });
  const [getExternalSource, { isFetching: isExternalSourceFetching }] = useLazyGetExternalSourceQuery();

  let query = new URLSearchParams();
  query.append('classes', entitiesClass.place);
  const { currentData: initialEntities, isFetching: initialPlacesLoading } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    sessionId: timestampRef,
    includeArtsdata: true,
  });
  const { currentData: initialExternalSource, isFetching: initialExternalSourceLoading } = useGetExternalSourceQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    sessionId: timestampRef,
  });

  useEffect(() => {
    if (initialEntities && currentCalendarData && initialExternalSourceLoading) {
      setPlacesList(initialEntities);
      setPlacesListArtsData(initialExternalSource?.artsdata);
    }
  }, [initialPlacesLoading]);

  // handlers

  const artsDataClickHandler = async (entity) => {
    navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.AddPlace}`, { state: { data: entity } });
  };

  const searchHandler = (value) => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.place);
    getEntities({ searchKey: value, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        setPlacesList(response);
      })
      .catch((error) => console.log(error));
    getExternalSource({
      searchKey: value,
      classes: decodeURIComponent(query.toString()),
      calendarId,
      excludeExistingCMS: true,
    })
      .unwrap()
      .then((response) => {
        setPlacesListArtsData(response?.artsdata);
      })
      .catch((error) => console.log(error));
  };

  const debounceSearch = useCallback(useDebounce(searchHandler, SEARCH_DELAY), []);

  return (
    !initialPlacesLoading && (
      <NewEntityLayout
        heading={t('dashboard.places.createNew.search.title')}
        entityName={t('dashboard.places.createNew.search.searchbarHeader')}
        text={t('dashboard.places.createNew.search.text')}>
        <div className="search-bar-places">
          <Popover
            data-cy="popover-places-search"
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
                <div className="popover-section-header" data-cy="div-place-footlight-title">
                  {t('dashboard.places.createNew.search.footlightSectionHeading')}
                </div>
                <div className="search-scrollable-content">
                  {isEntitiesFetching && (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LoadingIndicator />
                    </div>
                  )}
                  {!isEntitiesFetching &&
                    (placesList?.length > 0 ? (
                      placesList?.map((place, index) => (
                        <div
                          key={index}
                          className="search-popover-options"
                          onClick={() => {
                            setSelectedPlaces([...selectedPlaces, place]);
                            setIsPopoverOpen(false);
                          }}
                          data-cy={`div-place-footlight-${index}`}>
                          <EntityCard
                            title={contentLanguageBilingual({
                              en: place?.name?.en,
                              fr: place?.name?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                            description={contentLanguageBilingual({
                              en: place?.disambiguatingDescription?.en,
                              fr: place?.disambiguatingDescription?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                            artsDataLink={artsDataLinkChecker(place?.uri)}
                            Logo={
                              place.logo ? (
                                place.logo?.thumbnail?.uri
                              ) : (
                                <EnvironmentOutlined style={{ color: '#607EFC', fontSize: '18px' }} />
                              )
                            }
                            linkText={t('dashboard.places.createNew.search.linkText')}
                            onClick={() => {
                              if (routinghandler(user, calendarId, place?.creator?.userId, null, true)) {
                                navigate(
                                  `${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.AddPlace}?id=${place?.id}`,
                                );
                              } else navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}/${place?.id}`);
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
                    <div className="popover-section-header" data-cy="div-place-artsdata-title">
                      {t('dashboard.places.createNew.search.artsDataSectionHeading')}
                    </div>
                    <div className="search-scrollable-content">
                      {isExternalSourceFetching && (
                        <div
                          style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LoadingIndicator />
                        </div>
                      )}
                      {!isExternalSourceFetching &&
                        (placesListArtsData?.length > 0 ? (
                          placesListArtsData?.map((place, index) => (
                            <div
                              key={index}
                              className="search-popover-options"
                              onClick={() => {
                                setIsPopoverOpen(false);
                              }}
                              data-cy={`div-place-artsdata-${index}`}>
                              <EntityCard
                                title={contentLanguageBilingual({
                                  en: place?.name?.en,
                                  fr: place?.name?.fr,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                  calendarContentLanguage: calendarContentLanguage,
                                })}
                                description={place?.description}
                                artsDataLink={place?.uri}
                                Logo={
                                  place.logo ? (
                                    place.logo?.thumbnail?.uri
                                  ) : (
                                    <EnvironmentOutlined style={{ color: '#607EFC', fontSize: '18px' }} />
                                  )
                                }
                                linkText={t('dashboard.places.createNew.search.linkText')}
                                onClick={() => artsDataClickHandler(place)}
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
                      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.AddPlace}`, {
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
              data-cy="input-place-search"
              style={{ borderRadius: '4px' }}
              placeholder="Search places"
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

export default SearchPlaces;
