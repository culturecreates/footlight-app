import { Popover } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import './searchPerson.css';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';

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
  const [peopleListArtsData, setPeopleListArtsData] = useState([]);
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
    includeArtsdata: true,
  });

  // effects

  useEffect(() => {
    if (initialEntities && currentCalendarData) {
      setPeopleList(initialEntities?.cms);
      setPeopleListArtsData(initialEntities?.artsdata);
    }
  }, [initialPersonLoading]);

  // handlers

  const artsDataClickHandler = async (entity) => {
    navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.AddPerson}`, { state: { data: entity } });
  };

  const searchHandler = (value) => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.person);
    getEntities({ searchKey: value, classes: decodeURIComponent(query.toString()), calendarId, includeArtsdata: true })
      .unwrap()
      .then((response) => {
        setPeopleList(response?.cms);
        setPeopleListArtsData(response?.artsdata);
      })
      .catch((error) => console.log(error));
  };

  const debounceSearch = useCallback(useDebounce(searchHandler, SEARCH_DELAY), []);

  return (
    <NewEntityLayout
      heading={t('dashboard.people.createNew.search.title')}
      entityName={t('dashboard.people.createNew.search.searchbarHeader')}
      text={t('dashboard.people.createNew.search.text')}>
      <div className="search-bar-person">
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
                {t('dashboard.people.createNew.search.footlightSectionHeading')}
              </div>
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
                        Logo={
                          person.logo ? (
                            person.logo?.thumbnail?.uri
                          ) : (
                            <UserOutlined style={{ color: '#607EFC', fontSize: '18px' }} />
                          )
                        }
                        linkText={t('dashboard.people.createNew.search.linkText')}
                        onClick={() => {
                          if (routinghandler(user, calendarId, person?.creator?.userId, null, true)) {
                            navigate(
                              `${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.AddPerson}?id=${person?.id}`,
                            );
                          } else navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}/${person?.id}`);
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <NoContent />
                )}
              </div>

              {quickCreateKeyword.length > 0 && (
                <>
                  <div className="popover-section-header">
                    {t('dashboard.people.createNew.search.artsDataSectionHeading')}
                  </div>
                  <div className="search-scrollable-content">
                    {peopleListArtsData?.length > 0 ? (
                      peopleListArtsData?.map((person, index) => (
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
                            description={person?.description}
                            artsDataLink={person?.uri}
                            Logo={
                              person.logo ? (
                                person.logo?.thumbnail?.uri
                              ) : (
                                <UserOutlined style={{ color: '#607EFC', fontSize: '18px' }} />
                              )
                            }
                            linkText={t('dashboard.people.createNew.search.linkText')}
                            onClick={() => artsDataClickHandler(person)}
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
            style={{ borderRadius: '4px' }}
            placeholder="Search people"
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
  );
}

export default SearchPerson;
