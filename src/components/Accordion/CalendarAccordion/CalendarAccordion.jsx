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
import { useGetExternalSourceQuery, useLazyGetExternalSourceQuery } from '../../../services/externalSource';
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

const { Panel } = Collapse;

function CalendarAccordion(props) {
  const {
    name,
    role,
    selectedCalendarId,
    form,
    disabled,
    organizationIds,
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
  const { currentData: initialExternalSource, isFetching: initialExternalSourceLoading } = useGetExternalSourceQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    sessionId: timestampRef,
  });
  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery({ sessionId: timestampRef });
  const [getExternalSource, { isFetching: isExternalSourceFetching }] = useLazyGetExternalSourceQuery();
  const [getAllOrganization] = useLazyGetAllOrganizationQuery();

  const [organizersList, setOrganizersList] = useState([]);
  const [organizersArtsdataList, setOrganizersArtsdataList] = useState([]);
  const [organizersImportsFootlightList, setOrganizersImportsFootlightList] = useState([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');

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
        if (type == 'organizers') {
          setOrganizersArtsdataList(
            treeEntitiesOption(response?.artsdata, user, calendarContentLanguage, sourceOptions.ARTSDATA),
          );
          setOrganizersImportsFootlightList(
            treeEntitiesOption(response?.footlight, user, calendarContentLanguage, externalSourceOptions.FOOTLIGHT),
          );
        }
      })
      .catch((error) => console.log(error));
  };

  const debounceSearchOrganizationPersonSearch = useCallback(useDebounce(organizationPersonSearch, SEARCH_DELAY), []);

  useEffect(() => {
    if (selectedOrganizers && !readOnly) form.setFieldValue(['organizers', selectedCalendarId], selectedOrganizers);
  }, [selectedOrganizers]);

  useEffect(() => {
    if (initialEntities && currentCalendarData && !initialExternalSourceLoading) {
      setOrganizersList(treeEntitiesOption(initialEntities, user, calendarContentLanguage, sourceOptions.CMS));
      setOrganizersArtsdataList(
        treeEntitiesOption(initialExternalSource?.artsdata, user, calendarContentLanguage, sourceOptions.ARTSDATA),
      );
      setOrganizersImportsFootlightList(
        treeEntitiesOption(
          initialExternalSource?.footlight,
          user,
          calendarContentLanguage,
          externalSourceOptions.FOOTLIGHT,
        ),
      );
    }
  }, [initialEntityLoading, currentCalendarData, initialExternalSourceLoading]);

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
              disabled={
                selectedCalendarId === calendarId
                  ? role === userRoles.ADMIN || role === userRoles.EDITOR
                    ? false
                    : true
                  : true
              }
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
              data={[organizersList, organizersImportsFootlightList, organizersArtsdataList]}
              setFieldValue={() => {
                return;
              }}
              popOverHandler={() => setIsPopoverOpen({ ...isPopoverOpen, organizer: false })}
              isPopoverOpen={isPopoverOpen.organizer}>
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
                      {quickCreateKeyword !== '' && (
                        <>
                          <div className="popover-section-header" data-cy="div-organizers-artsdata-entity-heading">
                            {t('dashboard.organization.createNew.search.importsFromFootlight')}
                          </div>
                          <div className="search-scrollable-content">
                            {isExternalSourceFetching && (
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
                            {!isExternalSourceFetching &&
                              (organizersImportsFootlightList?.length > 0 ? (
                                organizersImportsFootlightList?.map((organizer, index) => (
                                  <div
                                    key={index}
                                    className="event-popover-options"
                                    onClick={() => {
                                      setSelectedOrganizers([...selectedOrganizers, organizer]);
                                      setIsPopoverOpen(false);
                                    }}
                                    data-cy={`div-select-import-footlight-organizer-${index}`}>
                                    {organizer?.label}
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
                          <div className="popover-section-header" data-cy="div-organizers-artsdata-entity-heading">
                            {t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                          </div>
                          <div className="search-scrollable-content">
                            {isExternalSourceFetching && (
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
                            {!isExternalSourceFetching &&
                              (organizersArtsdataList?.length > 0 ? (
                                organizersArtsdataList?.map((organizer, index) => (
                                  <div
                                    key={index}
                                    className="event-popover-options"
                                    onClick={() => {
                                      setSelectedOrganizers([...selectedOrganizers, organizer]);
                                      setIsPopoverOpen(false);
                                    }}
                                    data-cy={`div-select-artsdata-organizer-${index}`}>
                                    {organizer?.label}
                                  </div>
                                ))
                              ) : (
                                <NoContent />
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                }>
                <EventsSearch
                  style={{ borderRadius: '4px', display: selectedCalendarId === calendarId ? 'flex' : 'none' }}
                  placeholder={t('dashboard.events.addEditEvent.otherInformation.organizer.searchPlaceholder')}
                  onChange={(e) => {
                    setQuickCreateKeyword(e.target.value);
                    debounceSearchOrganizationPersonSearch(e.target.value, 'organizers');
                    setIsPopoverOpen(true);
                  }}
                  onClick={(e) => {
                    setQuickCreateKeyword(e.target.value);
                    setIsPopoverOpen(true);
                  }}
                  data-cy="input-quick-create-organizer-keyword"
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
      </Panel>
    </Collapse>
  );
}

export default CalendarAccordion;
