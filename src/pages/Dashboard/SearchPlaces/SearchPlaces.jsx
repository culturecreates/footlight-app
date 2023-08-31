import { Popover } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
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
import { useLazyGetArtsDataEntityQuery } from '../../../services/artsData';

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

  const [getEntities] = useLazyGetEntitiesQuery({ sessionId: timestampRef });
  const [getArtsDataEntity] = useLazyGetArtsDataEntityQuery({ sessionId: timestampRef });

  let query = new URLSearchParams();
  query.append('classes', entitiesClass.place);
  const { currentData: initialEntities, isLoading: initialPlacesLoading } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    sessionId: timestampRef,
  });

  useEffect(() => {
    if (initialEntities && currentCalendarData) {
      setPlacesList(initialEntities);
    }
  }, [initialPlacesLoading]);

  // handlers

  const searchHandler = (value) => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.place);
    getEntities({ searchKey: value, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        setPlacesList(response);
      })
      .catch((error) => console.log(error));

    getArtsDataEntity({ searchKeyword: value, entityType: entitiesClass.place })
      .unwrap()
      .then((response) => {
        setPlacesListArtsData(response?.result);
        console.log(placesListArtsData);
      })
      .catch((error) => console.log(error));
  };

  return (
    !initialPlacesLoading && (
      <NewEntityLayout
        heading={t('dashboard.places.createNew.search.title')}
        entityName={t('dashboard.places.createNew.search.searchbarHeader')}
        text={t('dashboard.places.createNew.search.text')}>
        <div className="search-bar-places">
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
                  {t('dashboard.places.createNew.search.footlightSectionHeading')}
                </div>
                <div className="search-scrollable-content">
                  {placesList?.length > 0 ? (
                    placesList?.map((place, index) => (
                      <div
                        key={index}
                        className="search-popover-options"
                        onClick={() => {
                          setSelectedPlaces([...selectedPlaces, place]);
                          setIsPopoverOpen(false);
                        }}>
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
                          onClick={() =>
                            navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.Search}`)
                          }
                        />
                      </div>
                    ))
                  ) : (
                    <NoContent />
                  )}
                </div>
                {quickCreateKeyword?.length > 0 && (
                  <CreateEntityButton
                    quickCreateKeyword={quickCreateKeyword}
                    onClick={() => {
                      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.Search}`, {
                        name: quickCreateKeyword,
                      });
                    }}
                  />
                )}
              </div>
            }>
            <EventsSearch
              style={{ borderRadius: '4px' }}
              placeholder="Search places"
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

export default SearchPlaces;
