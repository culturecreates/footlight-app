import React, { useEffect, useState, useRef } from 'react';
import './addEvent.css';
import { Form, Row, Col, Input } from 'antd';
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
import TextEditor from '../../../components/TextEditor';
const { TextArea } = Input;

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
  const [dateType, setDateType] = useState(eventData?.startDate && !isLoading ? 'single' : '');
  const reactQuillRefFr = useRef(null);
  const reactQuillRefEn = useRef(null);

  const saveAsDraftHandler = () => {
    form
      .validateFields()
      .then((values) => {
        console.log(values);
        reactQuillRefFr?.getLength();
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
              description: {
                en: values?.englishEditor,
                fr: values?.frenchEditor,
              },
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
    form
      .validateFields()
      .then(() => {
        updateEventState({ id: eventId, calendarId })
          .unwrap()
          .then(() =>
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`).catch((error) => console.log(error)),
          );
      })
      .catch((error) => console.log(error));
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
      <div>
        <Form form={form} layout="vertical" name="event">
          <Row gutter={[32, 24]} className="add-edit-wrapper">
            <Col span={24}>
              <Row justify="space-between">
                <Col>
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
            </Col>
            <Col flex={'723px'} className="add-event-section-col">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col flex={'423px'}>
                  <div className="add-event-section-wrapper">
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
                                  return Promise.reject(
                                    new Error(t('dashboard.events.addEditEvent.validations.title')),
                                  );
                              },
                            }),
                          ]}>
                          <TextArea
                            autoSize
                            autoComplete="off"
                            placeholder={t('dashboard.events.addEditEvent.language.placeHolderFrench')}
                            style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                            size="large"
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
                                  return Promise.reject(
                                    new Error(t('dashboard.events.addEditEvent.validations.title')),
                                  );
                              },
                            }),
                          ]}>
                          <TextArea
                            autoSize
                            autoComplete="off"
                            placeholder={t('dashboard.events.addEditEvent.language.placeHolderEnglish')}
                            style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                            size="large"
                          />
                        </Form.Item>
                      </BilingualInput>
                    </Form.Item>
                  </div>
                </Col>
                <Col flex="233px">
                  <div style={{ width: '100%' }}></div>
                </Col>
              </Row>
            </Col>
            <Col flex={'723px'} className="add-event-section-col">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-content">
                <Col flex={'423px'}>
                  <div className="add-event-section-wrapper">
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

                    {dateType === 'single' || eventData?.startDate ? (
                      <Row>
                        <Col flex={'423px'}>
                          <Form.Item
                            name="datePicker"
                            label={t('dashboard.events.addEditEvent.dates.date')}
                            initialValue={eventData?.startDate ? moment(eventData?.startDate) : ''}
                            rules={[{ required: true, message: t('dashboard.events.addEditEvent.validations.date') }]}>
                            <DatePickerStyled style={{ width: '423px' }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    ) : (
                      <Row>
                        <Col flex={'423px'}>
                          <Form.Item
                            name="datePickerWrapper"
                            dependencies={['datePicker']}
                            rules={[
                              ({ getFieldValue }) => ({
                                validator() {
                                  if (getFieldValue('datePicker')) {
                                    return Promise.resolve();
                                  } else
                                    return Promise.reject(
                                      new Error(t('dashboard.events.addEditEvent.validations.date')),
                                    );
                                },
                              }),
                            ]}>
                            <div className="date-buttons">
                              <DateAction
                                label={t('dashboard.events.addEditEvent.dates.singleDate')}
                                onClick={() => setDateType('single')}
                              />
                              <DateAction label={t('dashboard.events.addEditEvent.dates.dateRange')} disabled={true} />
                              <DateAction
                                label={t('dashboard.events.addEditEvent.dates.multipleDates')}
                                disabled={true}
                              />
                            </div>
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                  </div>
                </Col>
                <Col flex={'233px'}>
                  <div style={{ width: '100%' }}></div>
                </Col>
              </Row>
            </Col>
            <Col flex={'723px'} className="add-event-section-col">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col flex={'423px'}>
                  <div className="add-event-section-wrapper">
                    <Row>
                      <Col>
                        <div className="add-event-date-wrap">
                          {t('dashboard.events.addEditEvent.otherInformation.title')}
                        </div>
                      </Col>
                    </Row>
                    <Form.Item
                      label={t('dashboard.events.addEditEvent.otherInformation.description.title')}
                      required={true}>
                      <BilingualInput fieldData={eventData?.name}>
                        <TextEditor
                          formName="frenchEditor"
                          initialValue={eventData?.description?.fr}
                          dependencies={['englishEditor']}
                          currentReactQuillRef={reactQuillRefFr}
                          rules={[
                            () => ({
                              validator() {
                                if (
                                  reactQuillRefFr?.current?.unprivilegedEditor?.getLength() > 1 ||
                                  reactQuillRefEn?.current?.unprivilegedEditor?.getLength() > 1
                                ) {
                                  return Promise.resolve();
                                } else
                                  return Promise.reject(
                                    new Error(
                                      t('dashboard.events.addEditEvent.validations.otherInformation.emptyDescription'),
                                    ),
                                  );
                              },
                            }),
                          ]}
                        />

                        <TextEditor
                          formName="englishEditor"
                          initialValue={eventData?.description?.en}
                          dependencies={['frenchEditor']}
                          currentReactQuillRef={reactQuillRefEn}
                          rules={[
                            () => ({
                              validator() {
                                if (
                                  reactQuillRefFr?.current?.unprivilegedEditor?.getLength() > 1 ||
                                  reactQuillRefEn?.current?.unprivilegedEditor?.getLength() > 1
                                ) {
                                  return Promise.resolve();
                                } else
                                  return Promise.reject(
                                    new Error(
                                      t('dashboard.events.addEditEvent.validations.otherInformation.emptyDescription'),
                                    ),
                                  );
                              },
                            }),
                          ]}
                        />
                      </BilingualInput>
                    </Form.Item>
                  </div>
                </Col>
                <Col flex="233px">
                  <div style={{ width: '100%' }}></div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </div>
    )
  );
}

export default AddEvent;
