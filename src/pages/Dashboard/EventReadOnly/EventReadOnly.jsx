import React, { useState, useEffect } from 'react';
import { Row, Col, Breadcrumb } from 'antd';
import { LeftOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import './eventReadOnly.css';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useGetEventQuery } from '../../../services/events';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { bilingual } from '../../../utils/bilingual';
import { eventStatusOptions } from '../../../constants/eventStatus';
import { dateTypes } from '../../../constants/dateTypes';
import DateRangePicker from '../../../components/DateRangePicker';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import Tags from '../../../components/Tags/Common/Tags';
import { dateTimeTypeHandler } from '../../../utils/dateTimeTypeHandler';
import ImageUpload from '../../../components/ImageUpload';
import TreeSelectOption from '../../../components/TreeSelectOption';
import { treeTaxonomyOptions } from '../../../components/TreeSelectOption/treeSelectOption.settings';

function EventReadOnly() {
  const { t } = useTranslation();
  const { calendarId, eventId } = useParams();
  const { data: eventData, isLoading } = useGetEventQuery({ eventId, calendarId }, { skip: eventId ? false : true });
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.EVENT,
    includeConcepts: true,
  });
  const { user } = useSelector(getUserDetails);
  const [dateType, setDateType] = useState();

  let initialVirtualLocation = eventData?.locations?.filter((location) => location.isVirtualLocation == true);

  useEffect(() => {
    setDateType(
      dateTimeTypeHandler(eventData?.startDate, eventData?.startDateTime, eventData?.endDate, eventData?.endDateTime),
    );
  }, [isLoading]);

  return (
    !isLoading &&
    !taxonomyLoading && (
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
          <Col flex={'723px'} className="read-only-event-section-col">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col flex={'423px'}>
                <div className="read-only-event-section-wrapper">
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

                  {eventData?.additionalType.length > 0 && (
                    <>
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
                    </>
                  )}

                  {eventData?.audience.length > 0 && (
                    <>
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
                    </>
                  )}
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
                        {moment(eventData?.startDateTime ?? eventData?.startDate).format('MM/DD/YYYY')}
                      </p>
                    </>
                  )}
                  {dateType == dateTypes.RANGE && (
                    <>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.dates.dateRange')}
                      </p>
                      <p className="read-only-event-content-date">
                        <CalendarOutlined style={{ fontSize: '24px', color: '#1B3DE6', marginRight: '9px' }} />
                        <DateRangePicker
                          defaultValue={[
                            moment(eventData?.startDate ?? eventData?.startDateTime),
                            moment(eventData?.endDate ?? eventData?.endDateTime),
                          ]}
                          suffixIcon={false}
                          bordered={false}
                          allowClear={false}
                          inputReadOnly={true}
                          open={false}
                        />
                      </p>
                    </>
                  )}
                  <br />
                  <Row justify="space-between">
                    {eventData?.startDateTime && (
                      <Col>
                        <p className="read-only-event-content-sub-title-primary">
                          {t('dashboard.events.addEditEvent.dates.startTime')}
                        </p>
                        <p className="read-only-event-content">{moment(eventData?.startDateTime).format('h:mm a')}</p>
                      </Col>
                    )}
                    {eventData?.endDateTime && (
                      <Col>
                        <p className="read-only-event-content-sub-title-primary">
                          {t('dashboard.events.addEditEvent.dates.endTime')}
                        </p>
                        <p className="read-only-event-content">{moment(eventData?.endDateTime).format('h:mm a')}</p>
                      </Col>
                    )}
                  </Row>
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
                    {initialVirtualLocation?.length > 0 && (
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.location.virtualLocation')}
                      </p>
                    )}

                    {initialVirtualLocation[0]?.name.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{initialVirtualLocation[0]?.name.fr}</p>
                      </>
                    )}
                    {initialVirtualLocation[0]?.name.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{initialVirtualLocation[0]?.name.en}</p>
                      </>
                    )}

                    {initialVirtualLocation[0]?.url?.uri && (
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
                  <p className="read-only-event-content-sub-title-primary">
                    {t('dashboard.events.addEditEvent.otherInformation.description.title')}
                  </p>
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
                  <br />
                  {eventData?.image && eventData?.image?.original && (
                    <>
                      <p className="read-only-event-content-sub-title-primary">
                        {t('dashboard.events.addEditEvent.otherInformation.image.title')}
                      </p>
                      <ImageUpload imageUrl={eventData?.image?.original} imageReadOnly={true} />
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
        </Row>
      </div>
    )
  );
}

export default EventReadOnly;
