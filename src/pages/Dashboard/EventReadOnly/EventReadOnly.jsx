import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button } from 'antd';
import { CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import './eventReadOnly.css';
import { useTranslation } from 'react-i18next';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { useGetEventQuery } from '../../../services/events';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import { eventStatusOptions } from '../../../constants/eventStatus';
import { dateFrequencyOptions, dateTypes, daysOfWeek } from '../../../constants/dateTypes';
import DateRangePicker from '../../../components/DateRangePicker';
import { useGetAllTaxonomyQuery, useLazyGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import Tags from '../../../components/Tags/Common/Tags';
import { dateTimeTypeHandler } from '../../../utils/dateTimeTypeHandler';
import OutlinedButton from '../../../components/Button/Outlined';
import ImageUpload from '../../../components/ImageUpload';
import TreeSelectOption from '../../../components/TreeSelectOption';
import {
  treeDynamicTaxonomyOptions,
  treeEntitiesOption,
  treeTaxonomyOptions,
} from '../../../components/TreeSelectOption/treeSelectOption.settings';
import SelectOption from '../../../components/Select/SelectOption';
import { offerTypes } from '../../../constants/ticketOffers';
import { placesOptions } from '../../../components/Select/selectOption.settings';
import { entitiesClass } from '../../../constants/entitiesClass';
import SelectionItem from '../../../components/List/SelectionItem';
import Alert from '../../../components/Alert';
import { eventPublishState, eventPublishStateOptions } from '../../../constants/eventPublishState';
import { pluralize } from '../../../utils/pluralise';
import i18n from 'i18next';
import { eventFormRequiredFieldNames } from '../../../constants/eventFormRequiredFieldNames';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';
import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import { sourceOptions } from '../../../constants/sourceOptions';
import ArtsDataInfo from '../../../components/ArtsDataInfo/ArtsDataInfo';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import { getEmbedUrl } from '../../../utils/getEmbedVideoUrl';
import { sameAsTypes } from '../../../constants/sameAsTypes';
import MultipleImageUpload from '../../../components/MultipleImageUpload';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import ReadOnlyProtectedComponent from '../../../layout/ReadOnlyProtectedComponent';
import { PathName } from '../../../constants/pathName';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import ReadOnlyPageTabLayout from '../../../layout/ReadOnlyPageTabLayout';
import { getActiveTabKey } from '../../../redux/reducer/readOnlyTabSlice';
import { isDataValid } from '../../../utils/MultiLingualFormItemSupportFunctions';

function EventReadOnly() {
  const { t } = useTranslation();
  const { calendarId, eventId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
    isReadOnly,
  ] = useOutletContext();
  setContentBackgroundColor('#F9FAFF');

  const {
    data: eventData,
    isLoading,
    isSuccess,
  } = useGetEventQuery({ eventId, calendarId, sessionId: timestampRef }, { skip: eventId ? false : true });
  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.EVENT);
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
  });

  let query = new URLSearchParams();
  query.append('classes', entitiesClass.organization);
  query.append('classes', entitiesClass.person);

  const [getAllTaxonomy] = useLazyGetAllTaxonomyQuery({ sessionId: timestampRef });

  const { user } = useSelector(getUserDetails);
  const activeTabKey = useSelector(getActiveTabKey);

  const [dateType, setDateType] = useState();
  const [locationPlace, setLocationPlace] = useState();
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [selectedPerformers, setSelectedPerformers] = useState([]);
  const [selectedSupporters, setSelectedSupporters] = useState([]);

  const navigate = useNavigate();

  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  let initialVirtualLocation = eventData?.locations?.filter((location) => location.isVirtualLocation == true);
  let initialPlace = eventData?.locations?.filter((location) => location.isVirtualLocation == false);
  let requiredFields = currentCalendarData?.formSchema?.filter((form) => form?.formName === 'Event');
  requiredFields = requiredFields && requiredFields?.length > 0 && requiredFields[0];
  let standardAdminOnlyFields = requiredFields?.adminOnlyFields?.standardFields;
  let dynamicAdminOnlyFields = requiredFields?.adminOnlyFields?.dynamicFields;
  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  let artsDataLink = eventData?.sameAs?.filter((item) => item?.type === sameAsTypes.ARTSDATA_IDENTIFIER);
  const mainImageData = eventData?.image?.find((image) => image?.isMain) || null;
  const imageConfig = currentCalendarData?.imageConfig?.length > 0 && currentCalendarData?.imageConfig[0];

  const formConstants = currentCalendarData?.forms?.filter((form) => form?.formName === 'Event')[0];
  let mandatoryStandardFields = [];
  let mandatoryDynamicFields = [];
  formConstants?.formFieldProperties?.mandatoryFields?.standardFields?.forEach((field) => {
    if (isDataValid(field)) {
      const fieldValue = Object.values(field)[0];
      mandatoryStandardFields.push(fieldValue);
    }
  });
  formConstants?.formFieldProperties?.mandatoryFields?.dynamicFields?.forEach((field) => {
    if (isDataValid(field)) {
      mandatoryDynamicFields.push(field);
    }
  });

  const checkIfFieldIsToBeDisplayed = (field, data, type = 'standard') => {
    if (typeof data === 'string' && data !== '') return true;
    if (Array.isArray(data) && data.length > 0 && data.every((item) => item !== null && item !== undefined))
      return true;
    if (data !== null && isDataValid(data)) return true;

    if (type === 'standard') {
      return mandatoryStandardFields.includes(field);
    } else {
      return mandatoryDynamicFields.includes(field);
    }
  };

  useEffect(() => {
    if (!isLoading && isSuccess) {
      if (eventData?.recurringEvent || eventData?.subEventConfiguration?.length > 0) setDateType(dateTypes.MULTIPLE);
      else
        setDateType(
          dateTimeTypeHandler(
            eventData?.startDate,
            eventData?.startDateTime,
            eventData?.endDate,
            eventData?.endDateTime,
          ),
        );
      if (eventData?.organizer) {
        let initialOrganizers = eventData?.organizer?.map((organizer) => {
          return {
            disambiguatingDescription: organizer?.entity?.disambiguatingDescription,
            id: organizer?.entityId,
            name: organizer?.entity?.name,
            type: organizer?.type,
            logo: organizer?.entity?.logo,
            image: organizer?.entity?.image?.find((image) => image?.isMain),
          };
        });
        setSelectedOrganizers(treeEntitiesOption(initialOrganizers, user, calendarContentLanguage, sourceOptions.CMS));
      }
      if (eventData?.performer) {
        let initialPerformers = eventData?.performer?.map((performer) => {
          return {
            disambiguatingDescription: performer?.entity?.disambiguatingDescription,
            id: performer?.entityId,
            name: performer?.entity?.name,
            type: performer?.type,
            logo: performer?.entity?.logo,
            image: performer?.entity?.image?.find((image) => image?.isMain),
          };
        });
        setSelectedPerformers(treeEntitiesOption(initialPerformers, user, calendarContentLanguage, sourceOptions.CMS));
      }
      if (eventData?.collaborators) {
        let initialSupporters = eventData?.collaborators?.map((supporter) => {
          return {
            disambiguatingDescription: supporter?.entity?.disambiguatingDescription,
            id: supporter?.entityId,
            name: supporter?.entity?.name,
            type: supporter?.type,
            logo: supporter?.entity?.logo,
            image: supporter?.entity?.image?.find((image) => image?.isMain),
          };
        });
        setSelectedSupporters(treeEntitiesOption(initialSupporters, user, calendarContentLanguage, sourceOptions.CMS));
      }
      if (initialPlace && initialPlace?.length > 0) {
        initialPlace[0] = {
          ...initialPlace[0],
          ['openingHours']: initialPlace[0]?.openingHours?.uri,
        };
        let initialPlaceAccessibiltiy = [];
        if (initialPlace[0]?.accessibility?.length > 0 || initialPlace[0]?.regions?.length > 0) {
          let taxonomyClassQuery = new URLSearchParams();
          taxonomyClassQuery.append('taxonomy-class', taxonomyClass.PLACE);
          getAllTaxonomy({
            calendarId,
            search: '',
            taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
            includeConcepts: true,
            sessionId: timestampRef,
          })
            .unwrap()
            .then((res) => {
              res?.data?.forEach((taxonomy) => {
                if (taxonomy?.mappedToField === 'PlaceAccessibility') {
                  initialPlace[0]?.accessibility?.forEach((accessibility) => {
                    taxonomy?.concept?.forEach((concept) => {
                      if (concept?.id == accessibility?.entityId) {
                        initialPlaceAccessibiltiy = initialPlaceAccessibiltiy?.concat([concept]);
                      }
                    });
                  });
                }
              });
              initialPlace[0] = {
                ...initialPlace[0],
                ['accessibility']: initialPlaceAccessibiltiy,
              };
              res?.data?.map((taxonomy) => {
                if (taxonomy?.mappedToField == 'Region') {
                  taxonomy?.concept?.forEach((t) => {
                    if (initialPlace[0]?.regions[0]?.entityId == t?.id) {
                      initialPlace[0] = { ...initialPlace[0], regions: [t] };
                    }
                  });
                }
              });
              setLocationPlace(placesOptions(initialPlace, user, calendarContentLanguage)[0]);
            })
            .catch((error) => console.log(error));
        } else {
          initialPlace[0] = {
            ...initialPlace[0],
            ['accessibility']: [],
          };
          setLocationPlace(placesOptions(initialPlace, user, calendarContentLanguage)[0]);
        }
      }
    }
  }, [isLoading]);

  return (
    !isLoading &&
    !taxonomyLoading && (
      <div>
        <Row gutter={[32, 24]} className="read-only-wrapper events-read-only-wrapper " style={{ margin: 0 }}>
          <Col className="top-level-column" span={24}>
            <Row>
              <Col flex="auto">
                <Breadcrumbs
                  name={contentLanguageBilingual({
                    data: eventData?.name,
                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                    calendarContentLanguage: calendarContentLanguage,
                  })}
                />
              </Col>
              <Col flex="60px" style={{ marginLeft: 'auto' }}>
                <ReadOnlyProtectedComponent creator={eventData.createdByUserId} isReadOnly={isReadOnly}>
                  <div className="button-container">
                    <OutlinedButton
                      data-cy="button-edit-place"
                      label={t('dashboard.places.readOnly.edit')}
                      size="middle"
                      style={{ height: '40px', width: '60px' }}
                      onClick={() =>
                        navigate(
                          `${PathName.Dashboard}/${calendarId}${PathName.Events}${PathName.AddEvent}/${eventData.id}`,
                          {
                            replace: true,
                          },
                        )
                      }
                    />
                  </div>
                </ReadOnlyProtectedComponent>
              </Col>
            </Row>
          </Col>

          <Col span={24} className="top-level-column">
            <Row>
              <Col>
                <div className="read-only-event-heading">
                  <h4>
                    {bilingual({
                      data: eventData?.name,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                    })}
                  </h4>
                </div>
              </Col>
            </Row>
          </Col>

          {artsDataLink?.length > 0 && (
            <Col flex={'723px'} className="events-readonly-artsdata-link-wrapper top-level-column">
              <Row>
                <Col flex={'723px'}>
                  <ArtsDataInfo
                    artsDataLink={artsDataLinkChecker(artsDataLink[0]?.uri)}
                    name={contentLanguageBilingual({
                      data: eventData?.name,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                    disambiguatingDescription={contentLanguageBilingual({
                      data: eventData?.disambiguatingDescription,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  />
                </Col>
              </Row>
            </Col>
          )}
          {!routinghandler(user, calendarId, eventData?.creator?.userId, eventData?.publishState, false) && (
            <Col flex={'723px'} className="top-level-column">
              {eventPublishStateOptions?.map((state, index) => {
                if (
                  (state?.value === eventPublishState?.PENDING_REVIEW ||
                    state?.value === eventPublishState?.PUBLISHED) &&
                  eventData?.publishState === state?.value
                )
                  return (
                    <Alert
                      key={index}
                      message={state.infoText}
                      type="info"
                      showIcon
                      icon={<InfoCircleOutlined />}
                      additionalClassName="alert-information"
                    />
                  );
              })}
            </Col>
          )}

          <Col span={24} flex={'723px'} style={{ padding: '0px' }}>
            <Row>
              <ReadOnlyPageTabLayout>
                <Col span={24}>
                  <Row gutter={[32, 24]} style={{ margin: 0 }}>
                    <Col flex={'723px'} className="read-only-event-section-col top-level-column">
                      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        <Col flex={'423px'}>
                          <div className="read-only-event-section-wrapper">
                            <div
                              style={{
                                display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.NAME)
                                  ? adminCheckHandler({ calendar, user })
                                    ? 'initial'
                                    : 'none'
                                  : 'initial',
                              }}>
                              {checkIfFieldIsToBeDisplayed(eventFormRequiredFieldNames?.NAME, eventData?.name) && (
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.language.title')}
                                </p>
                              )}
                              {eventData?.name && (
                                <p className="read-only-event-content">
                                  {contentLanguageBilingual({
                                    calendarContentLanguage,
                                    data: eventData?.name,
                                    requiredLanguageKey: activeTabKey,
                                  })}
                                </p>
                              )}
                            </div>
                            {checkIfFieldIsToBeDisplayed(
                              eventFormRequiredFieldNames?.EVENT_TYPE,
                              eventData?.additionalType,
                            ) && (
                              <div
                                style={{
                                  display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.EVENT_TYPE)
                                    ? adminCheckHandler({ calendar, user })
                                      ? 'initial'
                                      : 'none'
                                    : 'initial',
                                }}>
                                <br />
                                <p className="read-only-event-content-sub-title-primary">
                                  {taxonomyDetails(allTaxonomyData?.data, user, 'EventType', 'name', false)}
                                </p>
                                {eventData?.additionalType.length > 0 && (
                                  <TreeSelectOption
                                    style={{ marginBottom: '1rem' }}
                                    bordered={false}
                                    showArrow={false}
                                    open={false}
                                    disabled
                                    treeData={treeTaxonomyOptions(
                                      allTaxonomyData,
                                      user,
                                      'EventType',
                                      false,
                                      calendarContentLanguage,
                                    )}
                                    defaultValue={eventData?.additionalType?.map((type) => {
                                      return type?.entityId;
                                    })}
                                    tagRender={(props) => {
                                      const { label } = props;
                                      return <Tags>{label}</Tags>;
                                    }}
                                  />
                                )}
                              </div>
                            )}
                            {checkIfFieldIsToBeDisplayed(
                              eventFormRequiredFieldNames?.AUDIENCE,
                              eventData?.audience,
                            ) && (
                              <div
                                style={{
                                  display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.AUDIENCE)
                                    ? adminCheckHandler({ calendar, user })
                                      ? 'initial'
                                      : 'none'
                                    : 'initial',
                                }}>
                                <p className="read-only-event-content-sub-title-primary">
                                  {taxonomyDetails(allTaxonomyData?.data, user, 'Audience', 'name', false)}
                                </p>
                                {eventData?.audience.length > 0 && (
                                  <TreeSelectOption
                                    style={{ marginBottom: '1rem' }}
                                    bordered={false}
                                    open={false}
                                    showArrow={false}
                                    disabled
                                    treeData={treeTaxonomyOptions(
                                      allTaxonomyData,
                                      user,
                                      'Audience',
                                      false,
                                      calendarContentLanguage,
                                    )}
                                    defaultValue={eventData?.audience?.map((audience) => {
                                      return audience?.entityId;
                                    })}
                                    tagRender={(props) => {
                                      const { label } = props;
                                      return <Tags>{label}</Tags>;
                                    }}
                                  />
                                )}
                              </div>
                            )}
                            {checkIfFieldIsToBeDisplayed(
                              eventFormRequiredFieldNames?.EVENT_DISCIPLINE,
                              eventData?.discipline,
                            ) && (
                              <div
                                style={{
                                  display: standardAdminOnlyFields?.includes(
                                    eventFormRequiredFieldNames?.EVENT_DISCIPLINE,
                                  )
                                    ? adminCheckHandler({ calendar, user })
                                      ? 'initial'
                                      : 'none'
                                    : 'initial',
                                }}>
                                <br />
                                <p className="read-only-event-content-sub-title-primary">
                                  {taxonomyDetails(allTaxonomyData?.data, user, 'EventDiscipline', 'name', false)}
                                </p>
                                {eventData?.discipline?.length > 0 && (
                                  <TreeSelectOption
                                    style={{ marginBottom: '1rem' }}
                                    bordered={false}
                                    showArrow={false}
                                    open={false}
                                    disabled
                                    treeData={treeTaxonomyOptions(
                                      allTaxonomyData,
                                      user,
                                      'EventDiscipline',
                                      false,
                                      calendarContentLanguage,
                                    )}
                                    defaultValue={eventData?.discipline?.map((type) => type?.entityId)}
                                    tagRender={(props) => {
                                      const { label } = props;
                                      return <Tags>{label}</Tags>;
                                    }}
                                  />
                                )}
                              </div>
                            )}
                            {allTaxonomyData?.data?.map((taxonomy, index) => {
                              if (taxonomy?.isDynamicField) {
                                let initialValues,
                                  initialTaxonomy = [];
                                eventData?.dynamicFields?.forEach((dynamicField) => {
                                  if (taxonomy?.id === dynamicField?.taxonomyId) {
                                    initialValues = dynamicField?.conceptIds;
                                    initialTaxonomy.push(taxonomy?.id);
                                  }
                                });

                                if (
                                  checkIfFieldIsToBeDisplayed(
                                    taxonomy?.id,
                                    initialTaxonomy?.includes(taxonomy?.id) ? taxonomy : undefined,
                                    'dynamic',
                                  )
                                )
                                  return (
                                    <div
                                      style={{
                                        display: dynamicAdminOnlyFields?.includes(taxonomy?.id)
                                          ? adminCheckHandler({ calendar, user })
                                            ? 'initial'
                                            : 'none'
                                          : 'initial',
                                      }}>
                                      <p className="read-only-event-content-sub-title-primary">
                                        {bilingual({
                                          data: taxonomy?.name,
                                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                        })}
                                      </p>
                                      {initialTaxonomy?.includes(taxonomy?.id) && initialValues?.length > 0 && (
                                        <TreeSelectOption
                                          key={index}
                                          style={{ marginBottom: '1rem' }}
                                          bordered={false}
                                          showArrow={false}
                                          open={false}
                                          disabled
                                          defaultValue={initialValues}
                                          treeData={treeDynamicTaxonomyOptions(
                                            taxonomy?.concept,
                                            user,
                                            calendarContentLanguage,
                                          )}
                                          tagRender={(props) => {
                                            const { label } = props;
                                            return <Tags>{label}</Tags>;
                                          }}
                                        />
                                      )}
                                    </div>
                                  );
                              }
                            })}
                          </div>
                        </Col>
                        <Col flex="233px">
                          <div style={{ width: '100%' }}></div>
                        </Col>
                      </Row>
                    </Col>
                    <Col flex={'723px'} className="read-only-event-section-col top-level-column">
                      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        <Col flex={'423px'}>
                          <div className="read-only-event-section-wrapper">
                            <p className="read-only-event-content-title">
                              {t('dashboard.events.addEditEvent.dates.dates')}
                            </p>
                            {dateType == dateTypes.SINGLE && (
                              <>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.dates.date')}
                                </p>
                                <p className="read-only-event-content-date">
                                  <CalendarOutlined
                                    style={{ fontSize: '24px', color: '#1B3DE6', marginRight: '9px' }}
                                  />
                                  {moment
                                    .tz(
                                      eventData?.startDateTime ?? eventData?.startDate,
                                      eventData?.scheduleTimezone ?? 'Canada/Eastern',
                                    )
                                    .format('MM/DD/YYYY')}
                                </p>
                              </>
                            )}

                            {(dateType == dateTypes.RANGE || dateType === dateTypes.MULTIPLE) && (
                              <>
                                <span
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '4px',
                                  }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="read-only-event-content-sub-title-primary">
                                      {t(
                                        `dashboard.events.addEditEvent.dates.${
                                          dateType === dateTypes.MULTIPLE ? `multipleDates` : `dateRange`
                                        }`,
                                      )}
                                    </span>
                                    {dateType === dateTypes.MULTIPLE && <span>-</span>}
                                    <span
                                      className="read-only-event-content-sub-title-primary"
                                      style={{ textTransform: 'capitalize' }}>
                                      {eventData?.recurringEvent?.frequency
                                        ? eventData?.recurringEvent?.frequency?.toLowerCase()
                                        : eventData?.subEventConfiguration?.length > 0 && dateFrequencyOptions[2].value}
                                    </span>
                                  </span>
                                  {dateType === dateTypes.MULTIPLE && eventData?.subEvents?.length > 0 && (
                                    <Tags
                                      style={{ color: '#1572BB', borderRadius: '4px', marginRight: '10px' }}
                                      color={'#DBF3FD'}>
                                      {pluralize(eventData?.subEvents?.length, t('dashboard.events.list.event'))}
                                    </Tags>
                                  )}
                                </span>
                                <Row>
                                  <Col flex="423px">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <CalendarOutlined
                                        style={{ fontSize: '24px', color: '#1B3DE6', marginRight: '9px' }}
                                      />
                                      <DateRangePicker
                                        defaultValue={[
                                          moment.tz(
                                            eventData?.startDate ?? eventData?.startDateTime,
                                            eventData?.scheduleTimezone ?? 'Canada/Eastern',
                                          ),
                                          moment.tz(
                                            eventData?.endDate ?? eventData?.endDateTime,
                                            eventData?.scheduleTimezone ?? 'Canada/Eastern',
                                          ),
                                        ]}
                                        bordered={false}
                                        allowClear={false}
                                        inputReadOnly={true}
                                        open={false}
                                        suffixIcon={false}
                                      />
                                    </div>
                                  </Col>
                                </Row>
                              </>
                            )}
                            <br />
                            <Row justify="space-between">
                              {eventData?.startDateTime &&
                                eventData?.recurringEvent?.frequency !== dateFrequencyOptions[2].value &&
                                !eventData?.subEventConfiguration && (
                                  <Col>
                                    <p className="read-only-event-content-sub-title-primary">
                                      {t('dashboard.events.addEditEvent.dates.startTime')}
                                    </p>
                                    <p className="read-only-event-content">
                                      {moment
                                        .tz(eventData?.startDateTime, eventData?.scheduleTimezone ?? 'Canada/Eastern')
                                        .format(i18n?.language === 'en' ? 'h:mm a' : 'HH:mm')}
                                    </p>
                                  </Col>
                                )}
                              {eventData?.endDateTime &&
                                eventData?.recurringEvent?.frequency !== dateFrequencyOptions[2].value &&
                                !eventData?.subEventConfiguration && (
                                  <Col>
                                    <p className="read-only-event-content-sub-title-primary">
                                      {t('dashboard.events.addEditEvent.dates.endTime')}
                                    </p>
                                    <p className="read-only-event-content">
                                      {moment
                                        .tz(eventData?.endDateTime, eventData?.scheduleTimezone ?? 'Canada/Eastern')
                                        .format(i18n?.language === 'en' ? 'h:mm a' : 'HH:mm')}
                                    </p>
                                  </Col>
                                )}
                            </Row>
                            <br />
                            {dateType === dateTypes.MULTIPLE &&
                              eventData?.recurringEvent?.frequency === dateFrequencyOptions[1].value && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {daysOfWeek.map((day, index) => {
                                    return (
                                      <Button
                                        key={index}
                                        className="recurring-day-buttons"
                                        style={{
                                          ...(eventData?.recurringEvent?.weekDays?.includes(day?.value) && {
                                            borderColor: '#607EFC',
                                            backgroundColor: '#EFF2FF',
                                          }),
                                        }}>
                                        {day.name}
                                      </Button>
                                    );
                                  })}
                                </div>
                              )}

                            <br />
                            {checkIfFieldIsToBeDisplayed(
                              eventFormRequiredFieldNames?.EVENT_STATUS,
                              eventData?.eventStatus,
                            ) && (
                              <>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.dates.status')}
                                </p>
                                {eventData?.eventStatus && (
                                  <p className="read-only-event-content">
                                    {eventStatusOptions?.map((status) => {
                                      if (status?.value === eventData?.eventStatus) return status?.label;
                                    })}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </Col>
                        <Col flex="233px">
                          <div style={{ width: '100%' }}></div>
                        </Col>
                      </Row>
                    </Col>
                    {checkIfFieldIsToBeDisplayed(eventFormRequiredFieldNames?.LOCATION, eventData?.locations) && (
                      <Col flex={'723px'} className="read-only-event-section-col top-level-column">
                        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                          <Col flex={'423px'}>
                            <div className="read-only-event-section-wrapper">
                              <p className="read-only-event-content-title">
                                {t('dashboard.events.addEditEvent.location.title')}
                              </p>
                              {checkIfFieldIsToBeDisplayed(
                                eventFormRequiredFieldNames?.LOCATION,
                                eventData?.locations[0],
                              ) && (
                                <div
                                  style={{
                                    display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.LOCATION)
                                      ? adminCheckHandler({ calendar, user })
                                        ? 'initial'
                                        : 'none'
                                      : 'initial',
                                  }}>
                                  <p className="read-only-event-content-sub-title-primary">
                                    {t('dashboard.events.addEditEvent.location.title')}
                                  </p>

                                  {locationPlace && initialPlace && initialPlace?.length > 0 && (
                                    <SelectionItem
                                      icon={locationPlace?.label?.props?.icon}
                                      name={locationPlace?.name}
                                      description={locationPlace?.description}
                                      region={locationPlace?.region}
                                      itemWidth="100%"
                                      postalAddress={locationPlace?.postalAddress}
                                      accessibility={locationPlace?.accessibility}
                                      openingHours={locationPlace?.openingHours}
                                      calendarContentLanguage={calendarContentLanguage}
                                      bordered
                                      onClickHandle={{
                                        navigationFlag: true,
                                        entityType: locationPlace?.type ?? 'Place',
                                        entityId: locationPlace?.key,
                                      }}
                                    />
                                  )}
                                </div>
                              )}

                              {initialVirtualLocation[0] && initialVirtualLocation?.length > 0 && (
                                <p className="read-only-event-content-sub-title-primary">
                                  <br />
                                  {t('dashboard.events.addEditEvent.location.virtualLocation')}
                                </p>
                              )}

                              {initialVirtualLocation[0] && initialVirtualLocation[0]?.name && (
                                <p className="read-only-event-content">
                                  {contentLanguageBilingual({
                                    calendarContentLanguage,
                                    data: initialVirtualLocation[0]?.name,
                                    requiredLanguageKey: activeTabKey,
                                  })}
                                </p>
                              )}

                              {initialVirtualLocation[0] && initialVirtualLocation[0]?.url?.uri && (
                                <>
                                  <p className="read-only-event-content-sub-title-secondary">
                                    {t('dashboard.events.addEditEvent.location.onlineLink')}
                                  </p>
                                  <a
                                    href={eventData?.contactPoint?.url?.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="url-links">
                                    {initialVirtualLocation[0]?.url?.uri}
                                  </a>
                                </>
                              )}
                            </div>
                          </Col>
                          <Col flex="233px">
                            <div style={{ width: '100%' }}></div>
                          </Col>
                        </Row>
                      </Col>
                    )}
                    <Col flex={'723px'} className="read-only-event-section-col top-level-column">
                      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        <Col flex={'423px'}>
                          <div className="read-only-event-section-wrapper">
                            <p className="read-only-event-content-title">
                              {t('dashboard.events.addEditEvent.otherInformation.title')}
                            </p>
                            <div
                              style={{
                                display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.DESCRIPTION)
                                  ? adminCheckHandler({ calendar, user })
                                    ? 'initial'
                                    : 'none'
                                  : 'initial',
                              }}>
                              {checkIfFieldIsToBeDisplayed(
                                eventFormRequiredFieldNames?.DESCRIPTION,
                                eventData?.description,
                              ) && (
                                <>
                                  <p className="read-only-event-content-sub-title-primary">
                                    {t('dashboard.events.addEditEvent.otherInformation.description.title')}
                                  </p>
                                  {eventData?.description && (
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: contentLanguageBilingual({
                                          data: eventData?.description,
                                          calendarContentLanguage,
                                          requiredLanguageKey: activeTabKey,
                                        }),
                                      }}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                            <br />
                            {checkIfFieldIsToBeDisplayed(eventFormRequiredFieldNames?.IMAGE, eventData?.image) && (
                              <div
                                style={{
                                  display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.IMAGE)
                                    ? adminCheckHandler({ calendar, user })
                                      ? 'initial'
                                      : 'none'
                                    : 'initial',
                                }}>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.otherInformation.image.mainImage')}
                                </p>
                                {eventData?.image?.length > 0 && mainImageData?.original?.uri && (
                                  <ImageUpload
                                    imageUrl={mainImageData?.large?.uri}
                                    imageReadOnly={true}
                                    preview={true}
                                    eventImageData={mainImageData}
                                  />
                                )}
                              </div>
                            )}
                            {eventData?.image?.length > 0 && imageConfig.enableGallery && (
                              <div
                                style={{
                                  display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.IMAGE)
                                    ? adminCheckHandler()
                                      ? 'initial'
                                      : 'none'
                                    : 'initial',
                                }}>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.otherInformation.image.additionalImages')}
                                </p>
                                <MultipleImageUpload
                                  imageReadOnly={true}
                                  largeAspectRatio={
                                    currentCalendarData?.imageConfig?.length > 0
                                      ? imageConfig?.large?.aspectRatio
                                      : null
                                  }
                                  thumbnailAspectRatio={
                                    currentCalendarData?.imageConfig?.length > 0
                                      ? imageConfig?.thumbnail?.aspectRatio
                                      : null
                                  }
                                  eventImageData={eventData?.image?.filter((image) => !image?.isMain)}
                                />
                              </div>
                            )}
                            {checkIfFieldIsToBeDisplayed(
                              eventFormRequiredFieldNames?.ORGANIZERS,
                              eventData?.organizer,
                            ) && (
                              <>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.otherInformation.organizer.title')}
                                </p>
                                {eventData?.organizer?.length > 0 &&
                                  selectedOrganizers?.map((organizer, index) => {
                                    return (
                                      <SelectionItem
                                        key={index}
                                        icon={organizer?.label?.props?.icon}
                                        name={organizer?.name}
                                        description={organizer?.description}
                                        calendarContentLanguage={calendarContentLanguage}
                                        bordered
                                        closable={false}
                                        itemWidth="100%"
                                        onClickHandle={{
                                          navigationFlag: true,
                                          entityType: organizer?.type,
                                          entityId: organizer?.value,
                                        }}
                                      />
                                    );
                                  })}
                              </>
                            )}
                            {checkIfFieldIsToBeDisplayed(
                              eventFormRequiredFieldNames?.CONTACT_TITLE,
                              eventData?.contactPoint,
                            ) && (
                              <p className="read-only-event-content-sub-title-primary">
                                {t('dashboard.events.addEditEvent.otherInformation.contact.title')}
                              </p>
                            )}
                            {eventData?.contactPoint && (
                              <>
                                <p className="read-only-event-content">
                                  {contentLanguageBilingual({
                                    calendarContentLanguage,
                                    data: eventData?.contactPoint?.name,
                                    requiredLanguageKey: activeTabKey,
                                  })}
                                </p>
                              </>
                            )}
                            {eventData?.contactPoint?.url?.uri && (
                              <>
                                <p className="read-only-event-content-sub-title-secondary">
                                  {t('dashboard.events.addEditEvent.otherInformation.contact.website')}
                                </p>
                                <p>
                                  <a
                                    href={eventData?.contactPoint?.url?.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="url-links">
                                    {eventData?.contactPoint?.url?.uri}
                                  </a>
                                </p>
                              </>
                            )}
                            {eventData?.contactPoint?.telephone && (
                              <>
                                <p className="read-only-event-content-sub-title-secondary">
                                  {t('dashboard.events.addEditEvent.otherInformation.contact.phoneNumber')}
                                </p>
                                <p>
                                  <p className="url-links">{eventData?.contactPoint?.telephone}</p>
                                </p>
                              </>
                            )}
                            {eventData?.contactPoint?.email && (
                              <>
                                <p className="read-only-event-content-sub-title-secondary">
                                  {t('dashboard.events.addEditEvent.otherInformation.contact.email')}
                                </p>
                                <p>
                                  <p className="url-links">{eventData?.contactPoint?.email}</p>
                                </p>
                              </>
                            )}
                            {checkIfFieldIsToBeDisplayed(
                              eventFormRequiredFieldNames?.PERFORMER,
                              eventData?.performer,
                            ) && (
                              <>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.otherInformation.performer.title')}
                                </p>

                                {eventData?.performer?.length > 0 &&
                                  selectedPerformers?.map((performer, index) => {
                                    return (
                                      <SelectionItem
                                        key={index}
                                        icon={performer?.label?.props?.icon}
                                        name={performer?.name}
                                        description={performer?.description}
                                        calendarContentLanguage={calendarContentLanguage}
                                        bordered
                                        closable={false}
                                        onClickHandle={{
                                          navigationFlag: true,
                                          entityType: performer?.type,
                                          entityId: performer?.value,
                                        }}
                                        itemWidth="100%"
                                      />
                                    );
                                  })}
                              </>
                            )}
                            {checkIfFieldIsToBeDisplayed(
                              eventFormRequiredFieldNames?.COLLABORATOR,
                              eventData?.collaborators,
                            ) && (
                              <>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.otherInformation.supporter.title')}
                                </p>
                                {eventData?.collaborators?.length > 0 &&
                                  selectedSupporters?.map((supporter, index) => {
                                    return (
                                      <SelectionItem
                                        key={index}
                                        icon={supporter?.label?.props?.icon}
                                        name={supporter?.name}
                                        description={supporter?.description}
                                        calendarContentLanguage={calendarContentLanguage}
                                        bordered
                                        itemWidth="100%"
                                        closable={false}
                                        onClickHandle={{
                                          navigationFlag: true,
                                          entityType: supporter?.type,
                                          entityId: supporter?.value,
                                        }}
                                      />
                                    );
                                  })}
                              </>
                            )}
                            {checkIfFieldIsToBeDisplayed(eventFormRequiredFieldNames?.EVENT_LINK, eventData?.url) && (
                              <>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.otherInformation.eventLink')}
                                </p>
                                {eventData?.url && eventData?.url?.uri && (
                                  <p>
                                    <a
                                      href={eventData?.url?.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="url-links">
                                      {eventData?.url?.uri}
                                    </a>
                                  </p>
                                )}
                              </>
                            )}
                            {checkIfFieldIsToBeDisplayed(
                              eventFormRequiredFieldNames?.VIDEO_URL,
                              eventData?.videoUrl,
                            ) && (
                              <>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.otherInformation.videoLink')}
                                </p>
                                {eventData?.videoUrl && (
                                  <p>
                                    <a
                                      href={eventData?.videoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="url-links">
                                      {eventData?.videoUrl}
                                    </a>
                                  </p>
                                )}
                              </>
                            )}
                            {getEmbedUrl(eventData?.videoUrl) !== '' && (
                              <Row>
                                <Col span={24}>
                                  <iframe
                                    className="iframe-video-embed"
                                    width="100%"
                                    height="315"
                                    src={getEmbedUrl(eventData?.videoUrl)}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowfullscreen></iframe>
                                </Col>
                              </Row>
                            )}
                            {checkIfFieldIsToBeDisplayed(
                              eventFormRequiredFieldNames?.FACEBOOK_URL,
                              eventData?.facebookUrl,
                            ) && (
                              <>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.otherInformation.facebookLink')}
                                </p>
                                {eventData?.facebookUrl && (
                                  <div style={{ width: '420px' }}>
                                    <p>
                                      <a
                                        href={eventData?.facebookUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="url-links">
                                        {eventData?.facebookUrl}
                                      </a>
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                            {checkIfFieldIsToBeDisplayed(
                              eventFormRequiredFieldNames?.KEYWORDS,
                              eventData?.keywords,
                            ) && (
                              <>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.otherInformation.keywords')}
                                </p>
                                {eventData?.keywords.length > 0 && (
                                  <SelectOption
                                    mode="tags"
                                    bordered={false}
                                    open={false}
                                    disabled
                                    defaultValue={eventData?.keywords}
                                    tagRender={(props) => {
                                      const { label } = props;
                                      return <Tags>{label}</Tags>;
                                    }}
                                  />
                                )}
                              </>
                            )}
                            {eventData?.inLanguage.length > 0 && (
                              <>
                                <p className="read-only-event-content-sub-title-primary">
                                  {taxonomyDetails(allTaxonomyData?.data, user, 'inLanguage', 'name', false)}
                                </p>
                                <TreeSelectOption
                                  style={{ marginBottom: '1rem' }}
                                  bordered={false}
                                  open={false}
                                  showArrow={false}
                                  disabled
                                  treeData={treeTaxonomyOptions(
                                    allTaxonomyData,
                                    user,
                                    'inLanguage',
                                    false,
                                    calendarContentLanguage,
                                  )}
                                  defaultValue={eventData?.inLanguage?.map((inLanguage) => {
                                    return inLanguage?.entityId;
                                  })}
                                  tagRender={(props) => {
                                    const { label } = props;
                                    return <Tags>{label}</Tags>;
                                  }}
                                />
                              </>
                            )}
                          </div>
                        </Col>
                        <Col flex="233px">
                          <div style={{ width: '100%' }}></div>
                        </Col>
                      </Row>
                    </Col>
                    {checkIfFieldIsToBeDisplayed(
                      eventFormRequiredFieldNames?.EVENT_ACCESSIBILITY,
                      eventData?.accessibility,
                    ) && (
                      <Col flex={'723px'} className="read-only-event-section-col top-level-column">
                        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                          <Col flex={'423px'}>
                            <div className="read-only-event-section-wrapper">
                              <p className="read-only-event-content-title">
                                {t('dashboard.events.addEditEvent.eventAccessibility.title')}
                              </p>
                              <>
                                <p className="read-only-event-content-sub-title-primary">
                                  {taxonomyDetails(allTaxonomyData?.data, user, 'EventAccessibility', 'name', false)}
                                </p>
                                {eventData?.accessibility.length > 0 && (
                                  <TreeSelectOption
                                    style={{ marginBottom: '1rem' }}
                                    bordered={false}
                                    open={false}
                                    showArrow={false}
                                    disabled
                                    treeData={treeTaxonomyOptions(
                                      allTaxonomyData,
                                      user,
                                      'EventAccessibility',
                                      false,
                                      calendarContentLanguage,
                                    )}
                                    defaultValue={eventData?.accessibility?.map((accessibility) => {
                                      return accessibility?.entityId;
                                    })}
                                    tagRender={(props) => {
                                      const { label } = props;
                                      return <Tags>{label}</Tags>;
                                    }}
                                  />
                                )}
                              </>

                              {eventData?.accessibilityNote && (
                                <>
                                  <p className="read-only-event-content-sub-title-primary">
                                    {t('dashboard.events.addEditEvent.eventAccessibility.note')}
                                  </p>
                                  <p className="read-only-event-content">
                                    {contentLanguageBilingual({
                                      calendarContentLanguage,
                                      data: eventData?.accessibilityNote,
                                      requiredLanguageKey: activeTabKey,
                                    })}
                                  </p>
                                </>
                              )}
                            </div>
                          </Col>
                          <Col flex="233px">
                            <div style={{ width: '100%' }}></div>
                          </Col>
                        </Row>
                      </Col>
                    )}
                    {checkIfFieldIsToBeDisplayed(
                      eventFormRequiredFieldNames?.TICKET_INFO,
                      eventData?.offerConfiguration,
                    ) && (
                      <Col flex={'723px'} className="read-only-event-section-col top-level-column">
                        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                          <Col flex={'423px'}>
                            <div
                              className="read-only-event-section-wrapper"
                              style={{
                                display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.TICKET_INFO)
                                  ? adminCheckHandler({ calendar, user })
                                    ? ''
                                    : 'none'
                                  : '',
                              }}>
                              <p className="read-only-event-content-title">
                                {t('dashboard.events.addEditEvent.tickets.title')}
                              </p>
                              {eventData?.offerConfiguration?.category === offerTypes.FREE && (
                                <>
                                  <p className="read-only-event-content-sub-title-primary">
                                    {t('dashboard.events.addEditEvent.tickets.description')}
                                  </p>
                                  <p>
                                    <p className="read-only-event-content">
                                      {t('dashboard.events.addEditEvent.tickets.free')}
                                    </p>
                                  </p>
                                </>
                              )}
                              {(eventData?.offerConfiguration?.url?.uri || eventData?.offerConfiguration?.email) && (
                                <>
                                  <p className="read-only-event-content-sub-title-primary">
                                    {eventData?.offerConfiguration?.category === offerTypes.PAYING
                                      ? t('dashboard.events.addEditEvent.tickets.buyTicketLink')
                                      : eventData?.offerConfiguration?.category === offerTypes.REGISTER &&
                                        t('dashboard.events.addEditEvent.tickets.registerLink')}
                                  </p>
                                  <p>
                                    <a
                                      href={
                                        eventData?.offerConfiguration?.url?.uri ?? eventData?.offerConfiguration?.email
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="url-links">
                                      {eventData?.offerConfiguration?.url?.uri ?? eventData?.offerConfiguration?.email}
                                    </a>
                                  </p>
                                </>
                              )}
                              {eventData?.offerConfiguration?.category === offerTypes.PAYING &&
                                eventData?.offerConfiguration?.prices?.length > 0 && (
                                  <table className="ticket-price-table">
                                    <tr>
                                      <th>
                                        <p className="read-only-event-content-sub-title-primary">
                                          {t('dashboard.events.addEditEvent.tickets.price')}
                                        </p>
                                      </th>
                                      <th>
                                        <p className="read-only-event-content-sub-title-primary">
                                          {t('dashboard.events.addEditEvent.tickets.description')}
                                        </p>
                                      </th>
                                    </tr>

                                    {eventData?.offerConfiguration?.prices?.map((offer, key) => {
                                      return (
                                        <tr key={key}>
                                          <td>
                                            <p className="read-only-event-content">
                                              {offer?.price}&nbsp;
                                              <span style={{ fontWeight: '400' }}>
                                                {t('dashboard.events.addEditEvent.tickets.CAD')}
                                              </span>
                                            </p>
                                          </td>
                                          <td>
                                            <p className="read-only-event-content">
                                              {contentLanguageBilingual({
                                                data: offer?.name,
                                                requiredLanguageKey: activeTabKey,
                                                calendarContentLanguage: calendarContentLanguage,
                                              })}
                                            </p>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </table>
                                )}
                              {eventData?.offerConfiguration?.name && (
                                <>
                                  <p className="read-only-event-content-sub-title-primary">
                                    {t('dashboard.events.addEditEvent.tickets.note')}
                                  </p>
                                  <p className="read-only-event-content">
                                    {contentLanguageBilingual({
                                      calendarContentLanguage,
                                      requiredLanguageKey: activeTabKey,
                                      data: eventData?.offerConfiguration?.name,
                                    })}
                                  </p>
                                </>
                              )}
                            </div>
                          </Col>
                          <Col flex="233px">
                            <div style={{ width: '100%' }}></div>
                          </Col>
                        </Row>
                      </Col>
                    )}
                  </Row>
                </Col>
              </ReadOnlyPageTabLayout>
            </Row>
          </Col>
        </Row>
      </div>
    )
  );
}

export default EventReadOnly;
