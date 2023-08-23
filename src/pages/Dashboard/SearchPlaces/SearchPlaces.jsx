import { Popover } from 'antd';
import React, { useEffect, useState } from 'react';
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

function SearchPlaces() {
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);
  const [currentCalendarData] = useOutletContext();
  const navigate = useNavigate();

  const { calendarId } = useParams();
  //   const timestampRef = useRef(Date.now()).current;
  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [placesList, setPlacesList] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');

  useEffect(() => {
    setPlacesList([]);
  }, []);

  const searchHandler = (value) => {
    console.log(value);
  };

  return (
    <NewEntityLayout
      heading={t('dashboard.places.createNew.search.title')}
      entityName={t('dashboard.places.createNew.search.searchbarHeader')}
      text={t('dashboard.places.createNew.search.text')}>
      <div className="search-bar-places">
        <Popover
          open={isPopoverOpen}
          arrow={false}
          overlayClassName="event-popover"
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
              <div className="search-scrollable-content">
                {placesList?.length > 0 ? (
                  placesList?.map((organizer, index) => (
                    <div
                      key={index}
                      className="search-popover-options"
                      onClick={() => {
                        setSelectedPlaces([...selectedPlaces, organizer]);
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
                        Logo={<EnvironmentOutlined style={{ color: '#607EFC', fontSize: '18px' }} />}
                        linkText={t('dashboard.places.createNew.search.linkText')}
                        onClick={() =>
                          navigate(
                            `${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.Places}${PathName.Search}`,
                          )
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
                    navigate(
                      `${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.Places}${PathName.Search}`,
                      { name: quickCreateKeyword },
                    );
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
  );
}

export default SearchPlaces;
