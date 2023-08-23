import { Popover } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import CreateEntityButton from '../../../components/Card/Common/CreateEntityButton';
import EntityCard from '../../../components/Card/Common/EntityCard';
import NoContent from '../../../components/NoContent/NoContent';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import { entitiesClass } from '../../../constants/entitiesClass';
import { PathName } from '../../../constants/pathName';
import NewEntityLayout from '../../../layout/CreateNewEntity/NewEntityLayout';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useGetEntitiesQuery, useLazyGetEntitiesQuery } from '../../../services/entities';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import { UserOutlined } from '@ant-design/icons';
import { contentLanguageBilingual } from '../../../utils/bilingual';

function SearchPerson() {
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);
  const [currentCalendarData] = useOutletContext();
  const navigate = useNavigate();

  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [peopleList, setPeopleList] = useState([]);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');
  const [selectedPeople, setSelectedPeople] = useState([]);

  const [getEntities] = useLazyGetEntitiesQuery({ sessionId: timestampRef });

  let query = new URLSearchParams();
  query.append('classes', entitiesClass.person);
  const { currentData: initialEntities, isLoading: initialPersonLoading } = useGetEntitiesQuery({
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

  const searchHandler = (value) => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.person);
    getEntities({ searchKey: value, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        setPeopleList(response);
      })
      .catch((error) => console.log(error));
  };

  return (
    <NewEntityLayout
      heading={t('dashboard.people.createNew.search.title')}
      entityName={t('dashboard.people.createNew.search.searchbarHeader')}
      text={t('dashboard.people.createNew.search.text')}>
      <div className="search-bar-organization">
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
                {peopleList?.length > 0 ? (
                  peopleList?.map((person, index) => (
                    <div
                      key={index}
                      className="search-popover-options"
                      onClick={() => {
                        setSelectedPeople([...selectedPeople, person]);
                        setIsPopoverOpen(false);
                      }}>
                      <EntityCard
                        title={contentLanguageBilingual({
                          en: person?.name?.en,
                          fr: person?.name?.fr,
                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                          calendarContentLanguage: calendarContentLanguage,
                        })}
                        description={contentLanguageBilingual({
                          en: person?.disambiguatingDescription?.en,
                          fr: person?.disambiguatingDescription?.fr,
                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                          calendarContentLanguage: calendarContentLanguage,
                        })}
                        artsDataLink={artsDataLinkChecker(person?.uri)}
                        Logo={<UserOutlined style={{ color: '#607EFC', fontSize: '18px' }} />}
                        linkText={t('dashboard.people.createNew.search.linkText')}
                        onClick={() =>
                          navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.Search}`)
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
                    navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.Search}`);
                  }}
                />
              )}
            </div>
          }>
          <EventsSearch
            style={{ borderRadius: '4px' }}
            placeholder="Search people"
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

export default SearchPerson;
