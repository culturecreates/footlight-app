import React, { useState, useRef, useCallback, useEffect } from 'react';
import './calendarAccordion.css';
import { Collapse, Form } from 'antd';
import { userRolesWithTranslation } from '../../../constants/userRoles';
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

const { Panel } = Collapse;

function CalendarAccordion(props) {
  const { name, role } = props;
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

  const onChange = (key) => {
    console.log(key);
  };

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

  return (
    <Collapse onChange={onChange} className="collapse-wrapper">
      <Panel header={name} key="1">
        <Form.Item
          name="eventStatus"
          label={t('dashboard.settings.addUser.userType')}
          initialValue={role}
          data-cy="form-item-event-status-label">
          <Select options={userRolesWithTranslation} data-cy="select-event-status" />
        </Form.Item>
        <Form.Item
          name="organizers"
          label={t('dashboard.organization.organization')}
          //   initialValue={selectedOrganizers}
        >
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
              overlayClassName="event-popover"
              placement="bottom"
              autoAdjustOverflow={false}
              getPopupContainer={(trigger) => trigger.parentNode}
              trigger={['click']}
              data-cy="popover-organizers"
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
                style={{ borderRadius: '4px' }}
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

          {selectedOrganizers?.map((organizer, index) => {
            return (
              <SelectionItem
                key={index}
                icon={organizer?.label?.props?.icon}
                name={organizer?.name}
                description={organizer?.description}
                bordered
                closable
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
