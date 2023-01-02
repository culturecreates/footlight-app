import React from 'react';
import { Row, Col } from 'antd';
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

  console.log(eventData);

  return (
    !isLoading && (
      <div>
        <Row gutter={[32, 24]} className="add-edit-wrapper">
          <Col span={24}>
            <Row>
              <Col>
                <div className="add-edit-event-heading">
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
          <Col flex={'723px'} className="add-event-section-col">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col flex={'423px'}>
                <div className="add-event-section-wrapper">
                  {t('dashboard.events.addEditEvent.language.placeHolderFrench')}
                  {/* <TextArea
                  autoSize
                  autoComplete="off"
                  placeholder={t('dashboard.events.addEditEvent.language.placeHolderFrench')}
                  style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                  size="large"
                /> */}

                  {/* <TextArea
                  autoSize
                  autoComplete="off"
                  placeholder={t('dashboard.events.addEditEvent.language.placeHolderEnglish')}
                  style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                  size="large"
                /> */}
                </div>
              </Col>
              <Col flex="233px">
                <div style={{ width: '100%' }}></div>
              </Col>
            </Row>
          </Col>
          <Col flex={'723px'} className="add-event-section-col">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col flex={'423px'}>
                <div className="add-event-section-wrapper">
                  {/* <TextArea
                  autoSize
                  autoComplete="off"
                  placeholder={t('dashboard.events.addEditEvent.language.placeHolderFrench')}
                  style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                  size="large"
                /> */}

                  {/* <TextArea
                  autoSize
                  autoComplete="off"
                  placeholder={t('dashboard.events.addEditEvent.language.placeHolderEnglish')}
                  style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                  size="large"
                /> */}
                </div>
              </Col>
              <Col flex="233px">
                <div style={{ width: '100%' }}></div>
              </Col>
            </Row>
          </Col>
          <Col flex={'723px'} className="add-event-section-col">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col flex={'423px'}>
                <div className="add-event-section-wrapper">
                  {/* <TextArea
                  autoSize
                  autoComplete="off"
                  placeholder={t('dashboard.events.addEditEvent.language.placeHolderFrench')}
                  style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                  size="large"
                /> */}

                  {/* <TextArea
                  autoSize
                  autoComplete="off"
                  placeholder={t('dashboard.events.addEditEvent.language.placeHolderEnglish')}
                  style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                  size="large"
                /> */}
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
