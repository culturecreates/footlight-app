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
import SelectOption from '../../../components/Select';
import Tags from '../../../components/Tags/Common/Tags';
import { taxonomyOptions } from '../../../components/Select/selectOption.settings';

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

  useEffect(() => {
    if (eventData?.startDate || eventData?.startDateTime) {
      if (eventData?.endDate || eventData?.endDateTime) {
        if (
          eventData?.startDateTime &&
          eventData?.endDateTime &&
          moment(eventData?.startDateTime).isSame(eventData?.endDateTime, 'day')
        )
          setDateType(dateTypes.SINGLE);
        else setDateType(dateTypes.RANGE);
      } else if (!eventData?.endDate && !eventData?.endDateTime) setDateType(dateTypes.SINGLE);
    }
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
                  <br />
                  <p className="read-only-event-content-sub-title-primary">
                    {t('dashboard.events.addEditEvent.language.eventType')}
                  </p>
                  <SelectOption
                    bordered={false}
                    open={false}
                    disabled
                    defaultValue={eventData?.additionalType?.map((type) => {
                      return type?.entityId;
                    })}
                    mode="tags"
                    options={taxonomyOptions(allTaxonomyData, user, 'EventType')}
                    tagRender={(props) => {
                      const { label } = props;
                      return <Tags>{label}</Tags>;
                    }}
                  />
                  <br />
                  <p className="read-only-event-content-sub-title-primary">
                    {t('dashboard.events.addEditEvent.language.targetAudience')}
                  </p>
                  <SelectOption
                    bordered={false}
                    open={false}
                    disabled
                    defaultValue={eventData?.audience?.map((audience) => {
                      return audience?.entityId;
                    })}
                    mode="tags"
                    options={taxonomyOptions(allTaxonomyData, user, 'Audience')}
                    tagRender={(props) => {
                      const { label } = props;
                      return <Tags>{label}</Tags>;
                    }}
                  />
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
                        {moment(eventData?.startDateTime).format('MM/DD/YYYY')}
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
                </div>
              </Col>
              <Col flex="233px">
                <div style={{ width: '100%' }}></div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    )
  );
}

export default EventReadOnly;
