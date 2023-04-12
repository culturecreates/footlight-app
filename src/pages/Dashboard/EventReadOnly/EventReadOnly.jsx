import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Breadcrumb, Button } from 'antd';
import Icon, { LeftOutlined, CalendarOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import './eventReadOnly.css';
import { useTranslation } from 'react-i18next';
import { useParams, useOutletContext } from 'react-router-dom';
import { useGetEventQuery } from '../../../services/events';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { bilingual } from '../../../utils/bilingual';
import { eventStatusOptions } from '../../../constants/eventStatus';
import { dateFrequencyOptions, dateTypes, daysOfWeek } from '../../../constants/dateTypes';
import DateRangePicker from '../../../components/DateRangePicker';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import Tags from '../../../components/Tags/Common/Tags';
import { dateTimeTypeHandler } from '../../../utils/dateTimeTypeHandler';
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
import { useGetAllPlacesQuery } from '../../../services/places';
import { entitiesClass } from '../../../constants/entitiesClass';
import { useGetEntitiesQuery } from '../../../services/entities';
import SelectionItem from '../../../components/List/SelectionItem';
import { ReactComponent as Organizations } from '../../../assets/icons/organisations.svg';
import Alert from '../../../components/Alert';
import { eventPublishState, eventPublishStateOptions } from '../../../constants/eventPublishState';
import { pluralize } from '../../../utils/pluralise';
import i18n from 'i18next';
import { userRoles } from '../../../constants/userRoles';
import { eventFormRequiredFieldNames } from '../../../constants/eventFormRequiredFieldNames';

function EventReadOnly() {
  const { t } = useTranslation();
  const { calendarId, eventId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const [currentCalendarData] = useOutletContext();

  const { data: eventData, isLoading } = useGetEventQuery(
    { eventId, calendarId, sessionId: timestampRef },
    { skip: eventId ? false : true },
  );
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.EVENT,
    includeConcepts: true,
  });
  const { currentData: allPlaces, isLoading: placesLoading } = useGetAllPlacesQuery({
    calendarId,
    sessionId: timestampRef,
  });

  let query = new URLSearchParams();
  query.append('classes', entitiesClass.organization);
  query.append('classes', entitiesClass.person);

  const { currentData: initialEntities, isLoading: initialEntityLoading } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(query.toString()),
    sessionId: timestampRef,
  });

  const { user } = useSelector(getUserDetails);
  const [dateType, setDateType] = useState();

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  let initialVirtualLocation = eventData?.locations?.filter((location) => location.isVirtualLocation == true);
  let initialPlace = eventData?.locations?.filter((location) => location.isVirtualLocation == false);
  let requiredFields = currentCalendarData?.formSchema?.filter((form) => form?.formName === 'Event');
  requiredFields = requiredFields && requiredFields?.length > 0 && requiredFields[0];
  let standardAdminOnlyFields = requiredFields?.adminOnlyFields?.standardFields;
  let dynamicAdminOnlyFields = requiredFields?.adminOnlyFields?.dynamicFields;

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };

  useEffect(() => {
    if (eventData?.recurringEvent) setDateType(dateTypes.MULTIPLE);
    else
      setDateType(
        dateTimeTypeHandler(eventData?.startDate, eventData?.startDateTime, eventData?.endDate, eventData?.endDateTime),
      );
  }, [isLoading]);

  return (
    !isLoading &&
    !taxonomyLoading &&
    !placesLoading &&
    !initialEntityLoading && (
      <div>
        <Row gutter={[32, 24]} className="read-only-wrapper">
          <Col span={24}>
            <Row>
              <Col>
                <Breadcrumb className="breadcrumb-item">
                  <Breadcrumb.Item>
                    <LeftOutlined style={{ marginRight: '17px' }} />
                    {t('dashboard.sidebar.events')}
                  </Breadcrumb.Item>
                  <Breadcrumb.Item className="breadcrumb-item">
                    {bilingual({
                      en: eventData?.name?.en,
                      fr: eventData?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                    })}
                  </Breadcrumb.Item>
                </Breadcrumb>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row>
              <Col>
                <div className="read-only-event-heading">
                  <h4>
                    {bilingual({
                      en: eventData?.name?.en,
                      fr: eventData?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                    })}
                  </h4>
                </div>
              </Col>
            </Row>
          </Col>
          <Col flex="723px">
            {eventPublishStateOptions?.map((state, index) => {
              if (
                (state?.value === eventPublishState?.PENDING_REVIEW || state?.value === eventPublishState?.PUBLISHED) &&
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
          <Col flex={'723px'} className="read-only-event-section-col">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col flex={'423px'}>
                <div className="read-only-event-section-wrapper">
                  <div
                    style={{
                      display:
                        standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.NAME) ||
                        standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.NAME_FR) ||
                        standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.NAME_EN)
                          ? adminCheckHandler()
                            ? 'initial'
                            : 'none'
                          : 'initial',
                    }}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.events.addEditEvent.language.title')}
                    </p>
                    {eventData?.name?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{eventData?.name?.fr}</p>
                      </>
                    )}

                    {eventData?.name?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{eventData?.name?.en}</p>
                      </>
                    )}
                  </div>
                  {eventData?.additionalType.length > 0 && (
                    <div
                      style={{
                        display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.EVENT_TYPE)
                          ? adminCheckHandler()
                            ? 'initial'
                            : 'none'
                          : 'initial',
                      }}>
                      <br />
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.language.eventType')}
                      </p>
                      <TreeSelectOption
                        style={{ marginBottom: '1rem' }}
                        bordered={false}
                        open={false}
                        disabled
                        treeData={treeTaxonomyOptions(allTaxonomyData, user, 'EventType')}
                        defaultValue={eventData?.additionalType?.map((type) => {
                          return type?.entityId;
                        })}
                        tagRender={(props) => {
                          const { label } = props;
                          return <Tags>{label}</Tags>;
                        }}
                      />
                    </div>
                  )}

                  {eventData?.audience.length > 0 && (
                    <div
                      style={{
                        display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.AUDIENCE)
                          ? adminCheckHandler()
                            ? 'initial'
                            : 'none'
                          : 'initial',
                      }}>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.language.targetAudience')}
                      </p>
                      <TreeSelectOption
                        style={{ marginBottom: '1rem' }}
                        bordered={false}
                        open={false}
                        disabled
                        treeData={treeTaxonomyOptions(allTaxonomyData, user, 'Audience')}
                        defaultValue={eventData?.audience?.map((audience) => {
                          return audience?.entityId;
                        })}
                        tagRender={(props) => {
                          const { label } = props;
                          return <Tags>{label}</Tags>;
                        }}
                      />
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
                      if (initialTaxonomy?.includes(taxonomy?.id) && initialValues?.length > 0)
                        return (
                          <div
                            style={{
                              display: dynamicAdminOnlyFields?.includes(taxonomy?.id)
                                ? adminCheckHandler()
                                  ? 'initial'
                                  : 'none'
                                : 'initial',
                            }}>
                            <p className="read-only-event-content-sub-title-primary">
                              {bilingual({
                                en: taxonomy?.name?.en,
                                fr: taxonomy?.name?.fr,
                                interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              })}
                            </p>
                            <TreeSelectOption
                              key={index}
                              style={{ marginBottom: '1rem' }}
                              bordered={false}
                              open={false}
                              disabled
                              defaultValue={initialValues}
                              treeData={treeDynamicTaxonomyOptions(taxonomy?.concept, user)}
                              tagRender={(props) => {
                                const { label } = props;
                                return <Tags>{label}</Tags>;
                              }}
                            />
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
          <Col flex={'723px'} className="read-only-event-section-col">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col flex={'423px'}>
                <div className="read-only-event-section-wrapper">
                  <p className="read-only-event-content-title">{t('dashboard.events.addEditEvent.dates.dates')}</p>
                  {dateType == dateTypes.SINGLE && (
                    <>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.dates.date')}
                      </p>
                      <p className="read-only-event-content-date">
                        <CalendarOutlined style={{ fontSize: '24px', color: '#1B3DE6', marginRight: '9px' }} />
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
                            {eventData?.recurringEvent?.frequency?.toLowerCase()}
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
                            <CalendarOutlined style={{ fontSize: '24px', color: '#1B3DE6', marginRight: '9px' }} />
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
                              // style={{ width: '423px' }}
                            />
                          </div>
                        </Col>
                      </Row>
                    </>
                  )}
                  <br />
                  <Row justify="space-between">
                    {eventData?.startDateTime &&
                      eventData?.recurringEvent?.frequency !== dateFrequencyOptions[2].value && (
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
                    {eventData?.endDateTime && eventData?.recurringEvent?.frequency !== dateFrequencyOptions[2].value && (
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
                  {eventData?.eventStatus && (
                    <>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.dates.status')}
                      </p>
                      <p className="read-only-event-content">
                        {eventStatusOptions?.map((status) => {
                          if (status?.value === eventData?.eventStatus) return status?.label;
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
          {eventData?.locations?.length > 0 && (
            <Col flex={'723px'} className="read-only-event-section-col">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col flex={'423px'}>
                  <div className="read-only-event-section-wrapper">
                    <p className="read-only-event-content-title">{t('dashboard.events.addEditEvent.location.title')}</p>
                    {initialPlace && initialPlace?.length > 0 && (
                      <div
                        style={{
                          display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.LOCATION)
                            ? adminCheckHandler()
                              ? 'initial'
                              : 'none'
                            : 'initial',
                        }}>
                        <p className="read-only-event-content-sub-title-primary">
                          {t('dashboard.events.addEditEvent.location.title')}
                        </p>
                        <SelectOption
                          disabled
                          bordered={false}
                          showArrow={false}
                          defaultValue={initialPlace && initialPlace[0]?.id}
                          options={placesOptions(allPlaces?.data, user)}
                        />
                      </div>
                    )}

                    {initialVirtualLocation[0] && initialVirtualLocation?.length > 0 && (
                      <p className="read-only-event-content-sub-title-primary">
                        <br />
                        {t('dashboard.events.addEditEvent.location.virtualLocation')}
                      </p>
                    )}

                    {initialVirtualLocation[0] && initialVirtualLocation[0]?.name.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{initialVirtualLocation[0]?.name.fr}</p>
                      </>
                    )}
                    {initialVirtualLocation[0] && initialVirtualLocation[0]?.name.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{initialVirtualLocation[0]?.name.en}</p>
                      </>
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
          <Col flex={'723px'} className="read-only-event-section-col">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col flex={'423px'}>
                <div className="read-only-event-section-wrapper">
                  <p className="read-only-event-content-title">
                    {t('dashboard.events.addEditEvent.otherInformation.title')}
                  </p>
                  <div
                    style={{
                      display:
                        standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.DESCRIPTION) ||
                        standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.DESCRIPTION_EN) ||
                        standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.DESCRIPTION_FR)
                          ? adminCheckHandler()
                            ? 'initial'
                            : 'none'
                          : 'initial',
                    }}>
                    {(eventData?.description?.fr || eventData?.description?.en) && (
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.otherInformation.description.title')}
                      </p>
                    )}
                    {eventData?.description?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <div dangerouslySetInnerHTML={{ __html: eventData?.description?.fr }} />
                      </>
                    )}
                    {eventData?.description?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <div dangerouslySetInnerHTML={{ __html: eventData?.description?.en }} />
                      </>
                    )}
                  </div>
                  <br />
                  {eventData?.image && eventData?.image?.original?.uri && (
                    <div
                      style={{
                        display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.IMAGE)
                          ? adminCheckHandler()
                            ? 'initial'
                            : 'none'
                          : 'initial',
                      }}>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.otherInformation.image.title')}
                      </p>
                      <ImageUpload imageUrl={eventData?.image?.original?.uri} imageReadOnly={true} />
                    </div>
                  )}
                  {eventData?.organizer?.length > 0 && (
                    <>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.otherInformation.organizer.title')}
                      </p>

                      <TreeSelectOption
                        filterTreeNode={false}
                        defaultValue={eventData?.organizer?.map((organizer) => organizer?.entityId)}
                        disabled={true}
                        bordered={false}
                        treeData={treeEntitiesOption(initialEntities, user)}
                        tagRender={(props) => {
                          const { value } = props;
                          let entity = initialEntities?.filter((entity) => entity?.id == value);
                          return (
                            entity &&
                            entity[0] && (
                              <SelectionItem
                                icon={
                                  entity[0]?.type?.toUpperCase() == taxonomyClass.ORGANIZATION ? (
                                    <Icon component={Organizations} style={{ color: '#607EFC' }} />
                                  ) : (
                                    entity[0]?.type?.toUpperCase() == taxonomyClass.PERSON && (
                                      <UserOutlined style={{ color: '#607EFC' }} />
                                    )
                                  )
                                }
                                name={bilingual({
                                  en: entity[0]?.name?.en,
                                  fr: entity[0]?.name?.fr,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                })}
                                description={bilingual({
                                  en: entity[0]?.disambiguatingDescription?.en,
                                  fr: entity[0]?.disambiguatingDescription?.fr,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                })}
                                bordered
                              />
                            )
                          );
                        }}
                      />
                    </>
                  )}
                  {eventData?.contactPoint && (
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.events.addEditEvent.otherInformation.contact.title')}
                    </p>
                  )}
                  {eventData?.contactPoint?.name?.fr && (
                    <>
                      <p className="read-only-event-content-sub-title-secondary">
                        {t('dashboard.events.addEditEvent.otherInformation.contact.frenchContactTitle')}
                      </p>
                      <p className="read-only-event-content">{eventData?.contactPoint?.name?.fr}</p>
                    </>
                  )}
                  {eventData?.contactPoint?.name?.en && (
                    <>
                      <p className="read-only-event-content-sub-title-secondary">
                        {t('dashboard.events.addEditEvent.otherInformation.contact.englishcontactTitle')}
                      </p>
                      <p className="read-only-event-content">{eventData?.contactPoint?.name?.en}</p>
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
                  {eventData?.performer?.length > 0 && (
                    <>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.otherInformation.performer.title')}
                      </p>

                      <TreeSelectOption
                        filterTreeNode={false}
                        defaultValue={eventData?.performer?.map((performer) => performer?.entityId)}
                        disabled={true}
                        bordered={false}
                        treeData={treeEntitiesOption(initialEntities, user)}
                        tagRender={(props) => {
                          const { value } = props;
                          let entity = initialEntities?.filter((entity) => entity?.id == value);
                          return (
                            entity &&
                            entity[0] && (
                              <SelectionItem
                                icon={
                                  entity[0]?.type?.toUpperCase() == taxonomyClass.ORGANIZATION ? (
                                    <Icon component={Organizations} style={{ color: '#607EFC' }} />
                                  ) : (
                                    entity[0]?.type?.toUpperCase() == taxonomyClass.PERSON && (
                                      <UserOutlined style={{ color: '#607EFC' }} />
                                    )
                                  )
                                }
                                name={bilingual({
                                  en: entity[0]?.name?.en,
                                  fr: entity[0]?.name?.fr,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                })}
                                description={bilingual({
                                  en: entity[0]?.disambiguatingDescription?.en,
                                  fr: entity[0]?.disambiguatingDescription?.fr,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                })}
                                bordered
                              />
                            )
                          );
                        }}
                      />
                    </>
                  )}
                  {eventData?.collaborators?.length > 0 && (
                    <>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.otherInformation.supporter.title')}
                      </p>

                      <TreeSelectOption
                        filterTreeNode={false}
                        defaultValue={eventData?.collaborators?.map((collaborator) => collaborator?.entityId)}
                        disabled={true}
                        bordered={false}
                        treeData={treeEntitiesOption(initialEntities, user)}
                        tagRender={(props) => {
                          const { value } = props;
                          let entity = initialEntities?.filter((entity) => entity?.id == value);
                          return (
                            entity &&
                            entity[0] && (
                              <SelectionItem
                                icon={
                                  entity[0]?.type?.toUpperCase() == taxonomyClass.ORGANIZATION ? (
                                    <Icon component={Organizations} style={{ color: '#607EFC' }} />
                                  ) : (
                                    entity[0]?.type?.toUpperCase() == taxonomyClass.PERSON && (
                                      <UserOutlined style={{ color: '#607EFC' }} />
                                    )
                                  )
                                }
                                name={bilingual({
                                  en: entity[0]?.name?.en,
                                  fr: entity[0]?.name?.fr,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                })}
                                description={bilingual({
                                  en: entity[0]?.disambiguatingDescription?.en,
                                  fr: entity[0]?.disambiguatingDescription?.fr,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                })}
                                bordered
                              />
                            )
                          );
                        }}
                      />
                    </>
                  )}
                  {eventData?.url && eventData?.url?.uri && (
                    <>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.otherInformation.eventLink')}
                      </p>
                      <p>
                        <a href={eventData?.url?.uri} target="_blank" rel="noopener noreferrer" className="url-links">
                          {eventData?.url?.uri}
                        </a>
                      </p>
                    </>
                  )}
                  {eventData?.videoUrl && (
                    <>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.otherInformation.videoLink')}
                      </p>
                      <p>
                        <a href={eventData?.videoUrl} target="_blank" rel="noopener noreferrer" className="url-links">
                          {eventData?.videoUrl}
                        </a>
                      </p>
                    </>
                  )}
                  {eventData?.facebookUrl && (
                    <>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.otherInformation.facebookLink')}
                      </p>
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
                    </>
                  )}
                  {eventData?.keywords.length > 0 && (
                    <>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.otherInformation.keywords')}
                      </p>
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
                    </>
                  )}
                  {eventData?.inLanguage.length > 0 && (
                    <>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.otherInformation.eventLanguage')}
                      </p>
                      <TreeSelectOption
                        style={{ marginBottom: '1rem' }}
                        bordered={false}
                        open={false}
                        disabled
                        treeData={treeTaxonomyOptions(allTaxonomyData, user, 'inLanguage')}
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
          {(eventData?.accessibility.length > 0 || eventData?.accessibilityNote) && (
            <Col flex={'723px'} className="read-only-event-section-col">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col flex={'423px'}>
                  <div className="read-only-event-section-wrapper">
                    <p className="read-only-event-content-title">
                      {t('dashboard.events.addEditEvent.eventAccessibility.title')}
                    </p>
                    {eventData?.accessibility.length > 0 && (
                      <>
                        <p className="read-only-event-content-sub-title-primary">
                          {t('dashboard.events.addEditEvent.eventAccessibility.title')}
                        </p>
                        <TreeSelectOption
                          style={{ marginBottom: '1rem' }}
                          bordered={false}
                          open={false}
                          disabled
                          treeData={treeTaxonomyOptions(allTaxonomyData, user, 'EventAccessibility')}
                          defaultValue={eventData?.accessibility?.map((accessibility) => {
                            return accessibility?.entityId;
                          })}
                          tagRender={(props) => {
                            const { label } = props;
                            return <Tags>{label}</Tags>;
                          }}
                        />
                      </>
                    )}

                    {(eventData?.accessibilityNote?.fr || eventData?.accessibilityNote?.en) && (
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.eventAccessibility.note')}
                      </p>
                    )}
                    {eventData?.accessibilityNote?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{eventData?.accessibilityNote?.fr}</p>
                      </>
                    )}
                    {eventData?.accessibilityNote?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{eventData?.accessibilityNote?.en}</p>
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
          {eventData?.offerConfiguration && (
            <Col flex={'723px'} className="read-only-event-section-col">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col flex={'423px'}>
                  <div
                    className="read-only-event-section-wrapper"
                    style={{
                      display: standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.FEATURED)
                        ? adminCheckHandler()
                          ? ''
                          : 'none'
                        : '',
                    }}>
                    <p className="read-only-event-content-title">{t('dashboard.events.addEditEvent.tickets.title')}</p>
                    {eventData?.offerConfiguration?.category === offerTypes.FREE && (
                      <>
                        <p className="read-only-event-content-sub-title-primary">
                          {t('dashboard.events.addEditEvent.tickets.description')}
                        </p>
                        <p>
                          <p className="read-only-event-content">{t('dashboard.events.addEditEvent.tickets.free')}</p>
                        </p>
                      </>
                    )}
                    {eventData?.offerConfiguration?.url?.uri &&
                      eventData?.offerConfiguration?.category === offerTypes.PAYING && (
                        <>
                          <p className="read-only-event-content-sub-title-primary">
                            {t('dashboard.events.addEditEvent.tickets.buyTicketLink')}
                          </p>
                          <p>
                            <a
                              href={eventData?.offerConfiguration?.url?.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="url-links">
                              {eventData?.offerConfiguration?.url?.uri}
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
                                    {bilingual({
                                      en: offer?.name?.en,
                                      fr: offer?.name?.fr,
                                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                    })}
                                  </p>
                                </td>
                              </tr>
                            );
                          })}
                        </table>
                      )}
                    {(eventData?.offerConfiguration?.name?.fr || eventData?.offerConfiguration?.name?.en) && (
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.tickets.note')}
                      </p>
                    )}
                    {eventData?.offerConfiguration?.name?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{eventData?.offerConfiguration?.name?.fr}</p>
                      </>
                    )}
                    {eventData?.offerConfiguration?.name?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{eventData?.offerConfiguration?.name?.en}</p>
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
      </div>
    )
  );
}

export default EventReadOnly;
