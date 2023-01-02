import React from 'react';
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

function EventReadOnly() {
  const { t } = useTranslation();
  const { calendarId, eventId } = useParams();
  const { data: eventData, isLoading } = useGetEventQuery({ eventId, calendarId }, { skip: eventId ? false : true });
  const { user } = useSelector(getUserDetails);

  return (
    !isLoading && (
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
                  <p className="read-only-event-content-sub-title-primary">
                    {t('dashboard.events.addEditEvent.dates.date')}
                  </p>
                  <p className="read-only-event-content-date">
                    <CalendarOutlined style={{ fontSize: '24px', color: '#1B3DE6', marginRight: '9px' }} />
                    {moment(eventData?.startDateTime).format('MM/DD/YYYY')}
                  </p>
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
