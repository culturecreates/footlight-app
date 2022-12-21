import React, { useEffect, useState } from 'react';
import './addEvent.css';
import { Form, Row, Col } from 'antd';
import LanguageInput from '../../../components/Input/Common/AuthenticationInput';
import moment from 'moment';
import { useAddEventMutation, useUpdateEventMutation } from '../../../services/events';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEventQuery, useUpdateEventStateMutation } from '../../../services/events';
import { PathName } from '../../../constants/pathName';
import Outlined from '../../../components/Button/Outlined';
import PrimaryButton from '../../../components/Button/Primary';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { userRoles } from '../../../constants/userRoles';
import PublishState from '../../../components/Dropdown/PublishState/PublishState';
import { eventPublishState } from '../../../constants/eventPublishState';
import DateAction from '../../../components/Button/DateAction';
import BilingualInput from '../../../components/BilingualInput';
import DatePickerStyled from '../../../components/DatePicker';

function AddEvent() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [addEvent] = useAddEventMutation();
  const { calendarId, eventId } = useParams();
  const { user } = useSelector(getUserDetails);
  const { t } = useTranslation();
  const {
    data: eventData,
    isError,
    isLoading,
  } = useGetEventQuery({ eventId, calendarId }, { skip: eventId ? false : true });
  const [updateEventState] = useUpdateEventStateMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [dateType, setDateType] = useState(eventData ? 'single' : '');

  const saveAsDraftHandler = () => {
    form
      .validateFields()
      .then((values) => {
        var startDate = new Date(values?.datePicker?._d);
        startDate = startDate?.toISOString();
        if (!eventId || eventId === '') {
          addEvent({
            data: {
              name: {
                en: values?.english,
                fr: values?.french,
              },
              startDate: startDate,
            },
            calendarId,
          })
            .unwrap()
            .then(() => {
              navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`).catch((error) => console.log(error));
            })
            .catch((errorInfo) => {
              console.log(errorInfo);
            });
        } else {
          updateEvent({
            data: {
              name: {
                en: values?.english,
                fr: values?.french,
              },
              startDate: startDate,
            },
            calendarId,
            eventId,
          })
            .unwrap()
            .then(() => {
              navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => console.log(error));
  };

  const reviewPublishHandler = () => {
    console.log({ eventId, calendarId });
    updateEventState({ id: eventId, calendarId })
      .unwrap()
      .then(() =>
        navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`).catch((error) => console.log(error)),
      );
  };

  useEffect(() => {
    if (isError) navigate(`${PathName.NotFound}`);
  }, [isError]);

  const roleCheckHandler = () => {
    const calendar = user?.roles.filter((calendar) => {
      return calendar.calendarId === calendarId;
    });
    if (
      calendar[0]?.role === userRoles.EDITOR ||
      calendar[0]?.role === userRoles.ADMIN ||
      calendar[0]?.role === userRoles.CONTRIBUTOR
    )
      return (
        <>
          <Form.Item>
            <Outlined label={t('dashboard.events.addEditEvent.saveOptions.saveAsDraft')} onClick={saveAsDraftHandler} />
          </Form.Item>
          <Form.Item>
            <PrimaryButton
              htmlType="submit"
              label={t('dashboard.events.addEditEvent.saveOptions.publish')}
              onClick={reviewPublishHandler}
            />
          </Form.Item>
        </>
      );
    else
      return (
        <>
          <Form.Item>
            <Outlined label={t('dashboard.events.addEditEvent.saveOptions.saveAsDraft')} onClick={saveAsDraftHandler} />
          </Form.Item>

          <Form.Item>
            <PrimaryButton
              htmlType="submit"
              label={t('dashboard.events.addEditEvent.saveOptions.sendToReview')}
              onClick={reviewPublishHandler}
            />
          </Form.Item>
        </>
      );
  };
  const ButtonDisplayHandler = () => {
    if (eventId && eventData?.publishState === eventPublishState.PUBLISHED)
      return (
        <>
          <Form.Item>
            <PublishState eventId={eventId}>
              <span>{eventData?.publishState}</span>
            </PublishState>
          </Form.Item>
          <Form.Item>
            <PrimaryButton
              htmlType="submit"
              label={t('dashboard.events.addEditEvent.saveOptions.save')}
              onClick={saveAsDraftHandler}
            />
          </Form.Item>
        </>
      );
    else return roleCheckHandler();
  };
  return (
    !isLoading && (
      <Form form={form} layout="vertical" name="event">
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="add-edit-wrapper">
          <Col span={24}>
            <Row gutter={[48]}>
              <Col span={18}>
                <div className="add-edit-event-heading">
                  <h4>
                    {eventId
                      ? t('dashboard.events.addEditEvent.heading.editEvent')
                      : t('dashboard.events.addEditEvent.heading.newEvent')}
                  </h4>
                </div>
              </Col>
              <Col>
                <div className="add-event-button-wrap">
                  <ButtonDisplayHandler />
                </div>
              </Col>
            </Row>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col xs={24} sm={24} md={12} lg={10} xl={8}>
                <Form.Item label={t('dashboard.events.addEditEvent.language.title')} required={true}>
                  <BilingualInput fieldData={eventData?.name}>
                    <Form.Item
                      name="french"
                      initialValue={eventData?.name?.fr}
                      dependencies={['english']}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue('english')) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <LanguageInput
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.language.placeHolderFrench')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="english"
                      initialValue={eventData?.name?.en}
                      dependencies={['french']}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue('french')) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <LanguageInput
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.language.placeHolderEnglish')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8' }}
                      />
                    </Form.Item>
                  </BilingualInput>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-content">
              <Col xs={24} sm={24} md={12} lg={10} xl={8}>
                <Row>
                  <Col>
                    <div className="add-event-date-wrap">{t('dashboard.events.addEditEvent.dates.dates')}</div>
                  </Col>
                </Row>
                {dateType === '' ? (
                  <Row>
                    <Col>
                      <p className="add-event-date-heading">{t('dashboard.events.addEditEvent.dates.heading')}</p>
                    </Col>
                  </Row>
                ) : (
                  <></>
                )}

                {dateType === 'single' ? (
                  <Row>
                    <Col span={24}>
                      <Form.Item
                        name="datePicker"
                        label={t('dashboard.events.addEditEvent.dates.date')}
                        initialValue={eventData?.startDate ? moment(eventData?.startDate) : ''}
                        rules={[{ required: true, message: t('dashboard.events.addEditEvent.validations.date') }]}>
                        <DatePickerStyled />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : (
                  <Row>
                    <Col>
                      <div className="date-buttons">
                        <DateAction
                          label={t('dashboard.events.addEditEvent.dates.singleDate')}
                          onClick={() => setDateType('single')}
                        />
                        <DateAction label={t('dashboard.events.addEditEvent.dates.dateRange')} disabled={true} />
                        <DateAction label={t('dashboard.events.addEditEvent.dates.multipleDates')} disabled={true} />
                      </div>
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    )
  );
}

export default AddEvent;
