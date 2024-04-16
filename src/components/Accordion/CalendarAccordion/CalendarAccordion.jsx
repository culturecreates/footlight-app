import React, { useState, useRef, useCallback, useEffect } from 'react';
import './calendarAccordion.css';
import { Button, Collapse, Form } from 'antd';
import { userRoles, userRolesWithTranslation } from '../../../constants/userRoles';
import KeyboardAccessibleLayout from '../../../layout/KeyboardAccessibleLayout/KeyboardAccessibleLayout';
import CustomPopover from '../../Popover/Popover';
import NoContent from '../../NoContent/NoContent';
import Select from '../../Select';
import { useTranslation } from 'react-i18next';
import { useGetEntitiesQuery, useLazyGetEntitiesQuery } from '../../../services/entities';
import { entitiesClass } from '../../../constants/entitiesClass';
import { useOutletContext, useParams } from 'react-router-dom';
import LoadingIndicator from '../../LoadingIndicator';
import { treeEntitiesOption } from '../../TreeSelectOption/treeSelectOption.settings';
import { externalSourceOptions, sourceOptions } from '../../../constants/sourceOptions';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useSelector } from 'react-redux';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import EventsSearch from '../../Search/Events/EventsSearch';
import SelectionItem from '../../List/SelectionItem';
import { sortByOptionsOrgsPlacesPerson } from '../../../constants/sortByOptions';
import { useLazyGetAllOrganizationQuery } from '../../../services/organization';
import { useLazyGetAllPeopleQuery } from '../../../services/people';

const { Panel } = Collapse;

function CalendarAccordion(props) {
  const {
    name,
    role,
    selectedCalendarId,
    form,
    disabled,
    organizationIds,
    peopleIds,
    readOnly,
    removeCalendarHandler,
    isCurrentUser,
  } = props;
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId } = useParams();
  const { user } = useSelector(getUserDetails);
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar, // eslint-disable-next-line no-unused-vars
    _setContentBackgroundColor,
  ] = useOutletContext();

  let query = new URLSearchParams();
  query.append('classes', entitiesClass.organization);
  const { currentData: initialEntities, isLoading: initialEntityLoading } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    sessionId: timestampRef,
  });

  let queryPerson = new URLSearchParams();
  queryPerson.append('classes', entitiesClass.person);
  const { currentData: initialPersonEntities, isLoading: initialPersonEntityLoading } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(queryPerson.toString()),
    sessionId: timestampRef,
  });

  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery({ sessionId: timestampRef });
  const [getAllOrganization] = useLazyGetAllOrganizationQuery();
  const [getAllPeople] = useLazyGetAllPeopleQuery();

  const [organizersList, setOrganizersList] = useState([]);
  const [peopleList, setPeopleList] = useState([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPeoplePopoverOpen, setIsPeoplePopoverOpen] = useState(false);

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const organizationPersonSearch = (value, type) => {
    let sourceQuery = new URLSearchParams();
    sourceQuery.append('sources', externalSourceOptions.ARTSDATA);
    sourceQuery.append('sources', externalSourceOptions.FOOTLIGHT);
    getEntities({ searchKey: value, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        if (type == 'organizers') {
          setOrganizersList(treeEntitiesOption(response, user, calendarContentLanguage, sourceOptions.CMS));
        }
        if (type == 'people') {
          setPeopleList(treeEntitiesOption(response, user, calendarContentLanguage, sourceOptions.CMS));
        }
      })
      .catch((error) => console.log(error));
  };

  const debounceSearchOrganizationPersonSearch = useCallback(useDebounce(organizationPersonSearch, SEARCH_DELAY), []);

  useEffect(() => {
    if (selectedOrganizers && !readOnly) form.setFieldValue(['organizers', selectedCalendarId], selectedOrganizers);
  }, [selectedOrganizers]);

  useEffect(() => {
    if (selectedPeople && !readOnly) form.setFieldValue(['people', selectedCalendarId], selectedPeople);
  }, [selectedPeople]);

  useEffect(() => {
    if (initialEntities && currentCalendarData) {
      setOrganizersList(treeEntitiesOption(initialEntities, user, calendarContentLanguage, sourceOptions.CMS));
    }
  }, [initialEntityLoading, currentCalendarData]);

  useEffect(() => {
    if (initialPersonEntities && currentCalendarData) {
      setPeopleList(treeEntitiesOption(initialPersonEntities, user, calendarContentLanguage, sourceOptions.CMS));
    }
  }, [initialPersonEntityLoading, currentCalendarData]);

  useEffect(() => {
    if (organizationIds?.length > 0) {
      let organizerIds = new URLSearchParams();
      organizationIds?.forEach((organizer) => organizerIds.append('ids', organizer?.entityId));
      getAllOrganization({
        calendarId,
        limit: 30,
        sessionId: timestampRef,
        pageNumber: 1,
        query: '',
        sort: `sort=asc(${sortByOptionsOrgsPlacesPerson[0]?.key})`,
        ids: organizerIds,
      })
        .unwrap()
        .then((response) => {
          if (response?.data?.length > 0)
            setSelectedOrganizers(
              treeEntitiesOption(
                response?.data?.map((v) => ({ ...v, type: entitiesClass.organization })),
                user,
                calendarContentLanguage,
                sourceOptions.CMS,
              ),
            );
          else setSelectedOrganizers([]);
        })
        .catch((error) => console.log(error));
    } else setSelectedOrganizers([]);
  }, [organizationIds]);

  useEffect(() => {
    if (peopleIds?.length > 0) {
      let peopleIdAsParams = new URLSearchParams();
      peopleIds?.forEach((organizer) => peopleIdAsParams.append('ids', organizer?.entityId));
      getAllPeople({
        calendarId,
        limit: 30,
        sessionId: timestampRef,
        pageNumber: 1,
        query: '',
        sort: `sort=asc(${sortByOptionsOrgsPlacesPerson[0]?.key})`,
        ids: peopleIdAsParams,
      })
        .unwrap()
        .then((response) => {
          if (response?.data?.length > 0)
            setSelectedPeople(
              treeEntitiesOption(
                response?.data?.map((v) => ({ ...v, type: entitiesClass.people })),
                user,
                calendarContentLanguage,
                sourceOptions.CMS,
              ),
            );
          else setSelectedPeople([]);
        })
        .catch((error) => console.log(error));
    } else setSelectedPeople([]);
  }, [peopleIds]);

  return (
    <Collapse
      className={`collapse-wrapper collapse-wrapper-${readOnly ? 'read-only' : 'editable'}`}
      collapsible={(disabled || readOnly) && 'disabled'}
      defaultActiveKey={calendarId === selectedCalendarId && ['1']}>
      <Panel
        header={name}
        key="1"
        showArrow={disabled || readOnly ? false : true}
        extra={
          isCurrentUser && (
            <div key={name} className="button-container">
              <Button
                type="text"
                key="list-loadmore-close"
                onClick={removeCalendarHandler}
                style={{ padding: '0px' }}
                data-cy="button-calendar-leave">
                {t('dashboard.settings.addUser.leave')}
              </Button>
            </div>
          )
        }>
        <Form.Item
          name={['userType', selectedCalendarId]}
          label={t('dashboard.settings.addUser.userType')}
          initialValue={role ?? userRoles.GUEST}
          data-cy="form-item-user-type-label">
          {!readOnly ? (
            <Select
              options={userRolesWithTranslation}
              data-cy="select-user-type"
              disabled={selectedCalendarId === calendarId ? false : true}
            />
          ) : (
            <p className="user-role-para" data-cy="para-user-role">
              {role &&
                userRolesWithTranslation?.find((roles) => {
                  if (roles?.value === role) return true;
                })?.label}
            </p>
          )}
        </Form.Item>
        <Form.Item
          name={['organizers', selectedCalendarId]}
          label={t('dashboard.organization.organization')}
          hidden={
            (readOnly && selectedOrganizers?.length === 0) ||
            (calendarId !== selectedCalendarId && selectedOrganizers?.length === 0)
              ? true
              : false
          }
          initialValue={selectedOrganizers}>
          {(disabled || !readOnly) && (
            <span className="span-organization-help-text">{t('dashboard.settings.addUser.organizationHelp')}</span>
          )}
          {!readOnly && (
            <KeyboardAccessibleLayout
              setItem={(organizer) => setSelectedOrganizers([...selectedOrganizers, organizer])}
              data={[organizersList]}
              setFieldValue={() => {
                return;
              }}
              popOverHandler={() => setIsPopoverOpen(false)}
              isPopoverOpen={isPopoverOpen}>
              <CustomPopover
                open={isPopoverOpen}
                onOpenChange={(open) => {
                  setIsPopoverOpen(open);
                }}
                destroyTooltipOnHide={true}
                overlayClassName="user-popover"
                placement="bottom"
                autoAdjustOverflow={false}
                getPopupContainer={(trigger) => trigger.parentNode}
                trigger={['click']}
                data-cy="user-organizers"
                content={
                  <div>
                    <div>
                      <>
                        <div className="popover-section-header" data-cy="div-organizers-footlight-entity-heading">
                          {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                        </div>
                        <div className="search-scrollable-content">
                          {isEntitiesFetching && (
                            <div
                              style={{
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <LoadingIndicator />
                            </div>
                          )}
                          {!isEntitiesFetching &&
                            (organizersList?.length > 0 ? (
                              organizersList?.map((organizer, index) => (
                                <div
                                  key={index}
                                  className="event-popover-options"
                                  onClick={() => {
                                    setSelectedOrganizers([...selectedOrganizers, organizer]);
                                    setIsPopoverOpen(false);
                                  }}
                                  data-cy={`div-select-organizer-${index}`}>
                                  {organizer?.label}
                                </div>
                              ))
                            ) : (
                              <NoContent />
                            ))}
                        </div>
                      </>
                    </div>
                  </div>
                }>
                <EventsSearch
                  style={{ borderRadius: '4px', display: selectedCalendarId === calendarId ? 'flex' : 'none' }}
                  placeholder={t('dashboard.events.addEditEvent.otherInformation.organizer.searchPlaceholder')}
                  onChange={(e) => {
                    debounceSearchOrganizationPersonSearch(e.target.value, 'organizers');
                    setIsPopoverOpen(true);
                  }}
                  onClick={() => {
                    setIsPopoverOpen(true);
                  }}
                  data-cy="input-organizer-keyword"
                />
              </CustomPopover>
            </KeyboardAccessibleLayout>
          )}

          {selectedOrganizers?.map((organizer, index) => {
            return (
              <SelectionItem
                key={index}
                icon={organizer?.label?.props?.icon}
                name={organizer?.name}
                description={organizer?.description}
                bordered
                closable={readOnly ? false : true}
                itemWidth="100%"
                onClose={() => {
                  setSelectedOrganizers(
                    selectedOrganizers?.filter((selectedOrganizer, indexValue) => indexValue != index),
                  );
                }}
                creatorId={organizer?.creatorId}
              />
            );
          })}
        </Form.Item>
        <Form.Item
          name={['people', selectedCalendarId]}
          label={t('dashboard.people.people')}
          hidden={
            (readOnly && selectedPeople?.length === 0) ||
            (calendarId !== selectedCalendarId && selectedPeople?.length === 0)
              ? true
              : false
          }
          initialValue={selectedPeople}>
          {(disabled || !readOnly) && (
            <span className="span-organization-help-text">{t('dashboard.settings.addUser.peopleHelp')}</span>
          )}
          {!readOnly && (
            <KeyboardAccessibleLayout
              setItem={(people) => setSelectedOrganizers([...selectedPeople, people])}
              data={[peopleList]}
              setFieldValue={() => {
                return;
              }}
              popOverHandler={() => setIsPeoplePopoverOpen(false)}
              isPopoverOpen={isPeoplePopoverOpen}>
              <CustomPopover
                open={isPeoplePopoverOpen}
                onOpenChange={(open) => {
                  setIsPeoplePopoverOpen(open);
                }}
                destroyTooltipOnHide={true}
                overlayClassName="user-popover"
                placement="bottom"
                autoAdjustOverflow={false}
                getPopupContainer={(trigger) => trigger.parentNode}
                trigger={['click']}
                data-cy="user-people"
                content={
                  <div>
                    <div>
                      <>
                        <div className="popover-section-header" data-cy="div-people-footlight-entity-heading">
                          {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                        </div>
                        <div className="search-scrollable-content">
                          {isEntitiesFetching && (
                            <div
                              style={{
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <LoadingIndicator />
                            </div>
                          )}
                          {!isEntitiesFetching &&
                            (peopleList?.length > 0 ? (
                              peopleList?.map((people, index) => (
                                <div
                                  key={index}
                                  className="event-popover-options"
                                  onClick={() => {
                                    setSelectedPeople([...selectedPeople, people]);
                                    setIsPeoplePopoverOpen(false);
                                  }}
                                  data-cy={`div-select-people-${index}`}>
                                  {people?.label}
                                </div>
                              ))
                            ) : (
                              <NoContent />
                            ))}
                        </div>
                      </>
                    </div>
                  </div>
                }>
                <EventsSearch
                  style={{ borderRadius: '4px', display: selectedCalendarId === calendarId ? 'flex' : 'none' }}
                  placeholder={t('dashboard.events.addEditEvent.otherInformation.organizer.searchPlaceholder')}
                  onChange={(e) => {
                    debounceSearchOrganizationPersonSearch(e.target.value, 'people');
                    setIsPeoplePopoverOpen(true);
                  }}
                  onClick={() => {
                    setIsPeoplePopoverOpen(true);
                  }}
                  data-cy="input-people-keyword"
                />
              </CustomPopover>
            </KeyboardAccessibleLayout>
          )}

          {selectedPeople?.map((people, index) => {
            return (
              <SelectionItem
                key={index}
                icon={people?.label?.props?.icon}
                name={people?.name}
                description={people?.description}
                bordered
                closable={readOnly ? false : true}
                itemWidth="100%"
                onClose={() => {
                  setSelectedPeople(selectedPeople?.filter((selectedOrganizer, indexValue) => indexValue != index));
                }}
                creatorId={people?.creatorId}
              />
            );
          })}
        </Form.Item>
      </Panel>
    </Collapse>
  );
}

export default CalendarAccordion;
