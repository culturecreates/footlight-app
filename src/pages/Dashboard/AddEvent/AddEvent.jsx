import React, { useEffect, useState, useRef } from 'react';
import './addEvent.css';
import { Form, Row, Col, Input } from 'antd';
import { SyncOutlined, InfoCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
import Select from '../../../components/Select';
import { eventStatus, eventStatusOptions } from '../../../constants/eventStatus';
import TimePickerStyled from '../../../components/TimePicker/TimePicker';
import DateRangePicker from '../../../components/DateRangePicker';
import { dateTypeOptions, dateTypes } from '../../../constants/dateTypes';
import ChangeType from '../../../components/ChangeType';
import CardEvent from '../../../components/Card/Common/Event';
import Tags from '../../../components/Tags/Common/Tags';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { dateTimeTypeHandler } from '../../../utils/dateTimeTypeHandler';
import ImageUpload from '../../../components/ImageUpload';
import Compressor from 'compressorjs';
import { useAddImageMutation } from '../../../services/image';
import TreeSelectOption from '../../../components/TreeSelectOption';
import { treeTaxonomyOptions } from '../../../components/TreeSelectOption/treeSelectOption.settings';
import StyledInput from '../../../components/Input/Common';
import { urlProtocolCheck } from '../../../components/Input/Common/input.settings';

const { TextArea } = Input;

function AddEvent() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [addEvent] = useAddEventMutation();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId, eventId } = useParams();
  const { user } = useSelector(getUserDetails);
  const { t } = useTranslation();
  const {
    currentData: eventData,
    isError,
    isLoading,
  } = useGetEventQuery({ eventId, calendarId, sessionId: timestampRef }, { skip: eventId ? false : true });
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.EVENT,
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [updateEventState] = useUpdateEventStateMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [addImage] = useAddImageMutation();

  const [dateType, setDateType] = useState();
  const reactQuillRefFr = useRef(null);
  const reactQuillRefEn = useRef(null);

  let initialVirtualLocation = eventData?.locations?.filter((location) => location.isVirtualLocation == true);

  const dateTimeConverter = (date, time) => {
    let dateSelected = moment(date).format('DD/MM/YYYY');
    let timeSelected = moment(time).format('hh:mm:ss a');
    let dateTime = moment(dateSelected + ' ' + timeSelected, 'DD/MM/YYYY HH:mm a');
    return moment(dateTime).toISOString();
  };
  const addUpdateEventApiHandler = (eventObj) => {
    if (!eventId || eventId === '') {
      addEvent({
        data: eventObj,
        calendarId,
      })
        .unwrap()
        .then(() => {
          navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);
        })
        .catch((errorInfo) => {
          console.log(errorInfo);
        });
    } else {
      updateEvent({
        data: eventObj,
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
  };
  const saveAsDraftHandler = () => {
    form
      .validateFields(['french', 'english', 'datePicker', 'dateRangePicker', 'datePickerWrapper'])
      .then(() => {
        var values = form.getFieldsValue(true);
        var startDateTime,
          endDateTime,
          additionalType = [],
          audience = [],
          contactPoint,
          accessibility = [],
          accessibilityNote,
          locationId,
          image;
        let eventObj;
        if (dateType === dateTypes.SINGLE) {
          if (values?.startTime) startDateTime = dateTimeConverter(values?.datePicker, values?.startTime);
          else startDateTime = moment(values?.datePicker).format('YYYY/MM/DD');
          if (values?.endTime) endDateTime = dateTimeConverter(values?.datePicker, values?.endTime);
        }
        if (dateType === dateTypes.RANGE) {
          if (values?.startTime) startDateTime = dateTimeConverter(values?.dateRangePicker[0], values?.startTime);
          else startDateTime = moment(values?.dateRangePicker[0]).format('YYYY/MM/DD');
          if (values?.endTime) endDateTime = dateTimeConverter(values?.dateRangePicker[1], values?.endTime);
          else endDateTime = moment(values?.dateRangePicker[1]).format('YYYY/MM/DD');
        }
        if (values?.eventType) {
          additionalType = values?.eventType?.map((eventTypeId) => {
            return {
              entityId: eventTypeId,
            };
          });
        }
        if (values?.targetAudience) {
          audience = values?.targetAudience?.map((audienceId) => {
            return {
              entityId: audienceId,
            };
          });
        }
        if (values?.frenchVirtualLocation || values?.englishVirtualLocation || values?.virtualLocationOnlineLink) {
          locationId = {
            place: {
              entityId: null,
            },
            virtualLocation: {
              name: {
                en: values?.englishVirtualLocation,
                fr: values?.frenchVirtualLocation,
              },
              description: {},
              dynamicFields: [],
              url: {
                uri: values?.virtualLocationOnlineLink,
              },
            },
          };
        }
        if (
          values?.frenchContactTitle ||
          values?.englishContactTitle ||
          values?.contactWebsiteUrl ||
          values?.contactEmail ||
          values?.contactPhoneNumber
        ) {
          contactPoint = {
            name: {
              en: values?.englishContactTitle,
              fr: values?.frenchContactTitle,
            },
            url: {
              uri: urlProtocolCheck(values?.contactWebsiteUrl),
            },
            email: values?.contactEmail,
            telephone: values?.contactPhoneNumber,
          };
        }
        if (values?.eventAccessibility) {
          accessibility = values?.eventAccessibility?.map((accessibilityId) => {
            return {
              entityId: accessibilityId,
            };
          });
        }

        if (values?.englishAccessibilityNote || values?.frenchAccessibilityNote) {
          accessibilityNote = {
            ...(values?.englishAccessibilityNote && { en: values?.englishAccessibilityNote }),
            ...(values?.frenchAccessibilityNote && { fr: values?.frenchAccessibilityNote }),
          };
        }

        eventObj = {
          name: {
            en: values?.english,
            fr: values?.french,
          },
          ...(values?.startTime && { startDateTime }),
          ...(!values?.startTime && { startDate: startDateTime }),
          ...(values?.endTime && { endDateTime }),
          ...(!values?.endTime && { endDate: endDateTime }),
          eventStatus: values?.eventStatus,
          ...((values?.englishEditor || values?.frenchEditor) && {
            description: {
              en: values?.englishEditor,
              fr: values?.frenchEditor,
            },
          }),
          ...(values?.eventAccessibility && {
            accessibility,
          }),
          ...(accessibilityNote && { accessibilityNote }),
          additionalType,
          audience,

          url: {
            uri: urlProtocolCheck(values?.eventLink),
          },

          ...(values?.facebookLink && { facebookUrl: urlProtocolCheck(values?.facebookLink) }),
          ...(values?.videoLink && { videoUrl: urlProtocolCheck(values?.videoLink) }),
          ...(contactPoint && { contactPoint }),
          ...(locationId && { locationId }),
        };
        if (values?.dragger && values?.dragger[0]?.originFileObj) {
          new Compressor(values?.dragger[0].originFileObj, {
            convertSize: 200000,
            success: (compressedResult) => {
              const formdata = new FormData();
              formdata.append('files', values?.dragger[0].originFileObj);
              formdata.append('files', new File([compressedResult], 'compressed' + compressedResult.name));
              formdata &&
                addImage({ data: formdata, calendarId })
                  .unwrap()
                  .then((response) => {
                    image = response?.data;
                    eventObj['image'] = image;
                    addUpdateEventApiHandler(eventObj);
                  })
                  .catch((error) => {
                    console.log(error);
                  });
            },
          });
        } else {
          //ToDo : Check with Backend whether to pass image object on removal
          if (values?.dragger && values?.length == 0) eventObj['image'] = null;

          addUpdateEventApiHandler(eventObj);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const reviewPublishHandler = () => {
    form
      .validateFields([
        'french',
        'english',
        'datePickerWrapper',
        'datePicker',
        'dateRangePicker',
        'englishEditor',
        'frenchEditor',
        'eventType',
        'targetAudience',
        'dragger-wrap',
        'location-form-wrapper',
      ])
      .then(() => {
        updateEventState({ id: eventId, calendarId })
          .unwrap()
          .then(() =>
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`).catch((error) => console.log(error)),
          );
      })
      .catch((error) => {
        console.log(error);
      });
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

  useEffect(() => {
    setDateType(
      dateTimeTypeHandler(eventData?.startDate, eventData?.startDateTime, eventData?.endDate, eventData?.endDateTime),
    );
  }, [isLoading]);

  return (
    !isLoading &&
    !taxonomyLoading && (
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
            <CardEvent>
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
                          } else return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
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
                          } else return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
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
                <Form.Item
                  name="eventType"
                  label={t('dashboard.events.addEditEvent.language.eventType')}
                  initialValue={eventData?.additionalType?.map((type) => {
                    return type?.entityId;
                  })}
                  rules={[
                    {
                      required: true,
                      message: t('dashboard.events.addEditEvent.validations.eventType'),
                    },
                  ]}>
                  <TreeSelectOption
                    allowClear
                    treeDefaultExpandAll
                    clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                    treeData={treeTaxonomyOptions(allTaxonomyData, user, 'EventType')}
                    tagRender={(props) => {
                      const { label, closable, onClose } = props;
                      return (
                        <Tags
                          closable={closable}
                          onClose={onClose}
                          closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                          {label}
                        </Tags>
                      );
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="targetAudience"
                  label={t('dashboard.events.addEditEvent.language.targetAudience')}
                  initialValue={eventData?.audience?.map((audience) => {
                    return audience?.entityId;
                  })}
                  rules={[
                    {
                      required: true,
                      message: t('dashboard.events.addEditEvent.validations.targetAudience'),
                    },
                  ]}>
                  <TreeSelectOption
                    allowClear
                    treeDefaultExpandAll
                    clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                    treeData={treeTaxonomyOptions(allTaxonomyData, user, 'Audience')}
                    tagRender={(props) => {
                      const { closable, onClose, label } = props;
                      return (
                        <Tags
                          closable={closable}
                          onClose={onClose}
                          closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                          {label}
                        </Tags>
                      );
                    }}
                  />
                </Form.Item>
              </Form.Item>
            </CardEvent>
            <CardEvent title={t('dashboard.events.addEditEvent.dates.dates')} required={true}>
              <>
                {!dateType ? (
                  <Row>
                    <Col>
                      <p className="add-event-date-heading">{t('dashboard.events.addEditEvent.dates.heading')}</p>
                    </Col>
                  </Row>
                ) : (
                  <></>
                )}

                {dateType ? (
                  <>
                    <Row>
                      <Col flex={'423px'}>
                        {dateType === dateTypes.SINGLE && (
                          <Form.Item
                            name="datePicker"
                            label={t('dashboard.events.addEditEvent.dates.date')}
                            initialValue={
                              dateTimeTypeHandler(
                                eventData?.startDate,
                                eventData?.startDateTime,
                                eventData?.endDate,
                                eventData?.endDateTime,
                              ) === dateTypes.SINGLE && moment(eventData?.startDate ?? eventData?.startDateTime)
                            }
                            rules={[{ required: true, message: t('dashboard.events.addEditEvent.validations.date') }]}>
                            <DatePickerStyled style={{ width: '423px' }} />
                          </Form.Item>
                        )}
                        {dateType === dateTypes.RANGE && (
                          <Form.Item
                            name="dateRangePicker"
                            label={t('dashboard.events.addEditEvent.dates.dateRange')}
                            initialValue={
                              dateTimeTypeHandler(
                                eventData?.startDate,
                                eventData?.startDateTime,
                                eventData?.endDate,
                                eventData?.endDateTime,
                              ) === dateTypes.RANGE && [
                                moment(eventData?.startDate ?? eventData?.startDateTime),
                                moment(eventData?.endDate ?? eventData?.endDateTime),
                              ]
                            }
                            rules={[{ required: true, message: t('dashboard.events.addEditEvent.validations.date') }]}>
                            <DateRangePicker style={{ width: '423px' }} />
                          </Form.Item>
                        )}
                      </Col>
                    </Row>
                    <Row justify="space-between">
                      <Col flex={'203.5px'}>
                        <Form.Item
                          name="startTime"
                          label={t('dashboard.events.addEditEvent.dates.startTime')}
                          initialValue={eventData?.startDateTime ? moment(eventData?.startDateTime) : undefined}>
                          <TimePickerStyled />
                        </Form.Item>
                      </Col>
                      <Col flex={'203.5px'}>
                        <Form.Item
                          name="endTime"
                          label={t('dashboard.events.addEditEvent.dates.endTime')}
                          initialValue={eventData?.endDateTime ? moment(eventData?.endDateTime) : undefined}>
                          <TimePickerStyled />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ) : (
                  <Row>
                    <Col flex={'423px'}>
                      <Form.Item
                        name="datePickerWrapper"
                        dependencies={['datePicker']}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator() {
                              if (getFieldValue('datePicker') || getFieldValue('dateRangePicker')) {
                                return Promise.resolve();
                              } else
                                return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.date')));
                            },
                          }),
                        ]}>
                        <div className="date-buttons">
                          <DateAction
                            label={t('dashboard.events.addEditEvent.dates.singleDate')}
                            onClick={() => setDateType(dateTypes.SINGLE)}
                          />
                          <DateAction
                            label={t('dashboard.events.addEditEvent.dates.dateRange')}
                            onClick={() => setDateType(dateTypes.RANGE)}
                          />
                          <DateAction label={t('dashboard.events.addEditEvent.dates.multipleDates')} disabled={true} />
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col flex={'423px'}>
                    <Form.Item
                      name="eventStatus"
                      label={t('dashboard.events.addEditEvent.dates.status')}
                      initialValue={eventData?.eventStatus ?? eventStatus.EventScheduled}>
                      <Select options={eventStatusOptions} />
                    </Form.Item>
                  </Col>
                </Row>
              </>

              {dateType && (
                <Form.Item label="Change date type" style={{ lineHeight: '2.5' }}>
                  {dateTypeOptions.map((type) => {
                    if (dateType != type.type)
                      return (
                        <ChangeType
                          key={type.type}
                          primaryIcon={<SyncOutlined />}
                          disabled={type.disabled}
                          label={type.label}
                          promptText={type.tooltip}
                          secondaryIcon={<InfoCircleOutlined />}
                          onClick={() => {
                            setDateType(type.type);
                            form.resetFields(['datePicker', 'dateRangePicker']);
                          }}
                        />
                      );
                  })}
                </Form.Item>
              )}
            </CardEvent>
            <CardEvent title={t('dashboard.events.addEditEvent.location.title')} required={true}>
              <Form.Item
                name="location-form-wrapper"
                rules={[
                  ({ getFieldValue }) => ({
                    validator() {
                      if (
                        getFieldValue('frenchVirtualLocation') ||
                        getFieldValue('englishVirtualLocation') ||
                        getFieldValue('virtualLocationOnlineLink')
                      ) {
                        return Promise.resolve();
                      } else return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.location')));
                    },
                  }),
                ]}>
                <Form.Item label={t('dashboard.events.addEditEvent.location.virtualLocation')}>
                  <BilingualInput fieldData={initialVirtualLocation[0]?.name}>
                    <Form.Item name="frenchVirtualLocation" initialValue={initialVirtualLocation[0]?.name?.fr}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.location.placeHolderVirtualLocationFr')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item name="englishVirtualLocation" initialValue={initialVirtualLocation[0]?.name?.en}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.location.placeHolderVirtualLocationEn')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                  </BilingualInput>
                </Form.Item>
                <Form.Item
                  name="virtualLocationOnlineLink"
                  className="subheading-wrap"
                  label={t('dashboard.events.addEditEvent.location.onlineLink')}
                  initialValue={initialVirtualLocation[0]?.url?.uri}
                  rules={[
                    {
                      type: 'url',
                      message: t('dashboard.events.addEditEvent.validations.url'),
                    },
                  ]}>
                  <StyledInput
                    addonBefore="https://"
                    autoComplete="off"
                    placeholder={t('dashboard.events.addEditEvent.location.placeHolderOnlineLink')}
                  />
                </Form.Item>
              </Form.Item>
            </CardEvent>
            <CardEvent title={t('dashboard.events.addEditEvent.otherInformation.title')}>
              <>
                <Form.Item
                  label={t('dashboard.events.addEditEvent.otherInformation.description.title')}
                  required={true}>
                  <BilingualInput fieldData={eventData?.description}>
                    <TextEditor
                      formName="frenchEditor"
                      initialValue={eventData?.description?.fr}
                      dependencies={['englishEditor']}
                      currentReactQuillRef={reactQuillRefFr}
                      placeholder={t('dashboard.events.addEditEvent.otherInformation.description.frenchPlaceholder')}
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
                        () => ({
                          validator() {
                            if (reactQuillRefFr?.current?.unprivilegedEditor?.getText().split(' ').length > 49) {
                              return Promise.resolve();
                            } else if (reactQuillRefEn?.current?.unprivilegedEditor?.getText().split(' ').length > 49)
                              return Promise.resolve();
                            else
                              return Promise.reject(
                                new Error(t('dashboard.events.addEditEvent.validations.otherInformation.frenchShort')),
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
                      placeholder={t('dashboard.events.addEditEvent.otherInformation.description.englishPlaceholder')}
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
                        () => ({
                          validator() {
                            if (reactQuillRefEn?.current?.unprivilegedEditor?.getText().split(' ').length > 49) {
                              return Promise.resolve();
                            } else if (reactQuillRefFr?.current?.unprivilegedEditor?.getText().split(' ').length > 49)
                              return Promise.resolve();
                            else
                              return Promise.reject(
                                new Error(t('dashboard.events.addEditEvent.validations.otherInformation.englishShort')),
                              );
                          },
                        }),
                      ]}
                    />
                  </BilingualInput>
                </Form.Item>
                <Form.Item
                  label={t('dashboard.events.addEditEvent.otherInformation.image.title')}
                  name="dragger-wrap"
                  initialValue={eventData?.image && eventData?.image?.original}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator() {
                        if (
                          (getFieldValue('dragger') != undefined && getFieldValue('dragger')?.length > 0) ||
                          (eventData?.image?.original && !getFieldValue('dragger')) ||
                          (eventData?.image?.original && getFieldValue('dragger')?.length > 0)
                        ) {
                          return Promise.resolve();
                        } else
                          return Promise.reject(
                            new Error(t('dashboard.events.addEditEvent.validations.otherInformation.emptyImage')),
                          );
                      },
                    }),
                  ]}>
                  <Row>
                    <Col>
                      <p className="add-event-date-heading">
                        {t('dashboard.events.addEditEvent.otherInformation.image.subHeading')}
                      </p>
                    </Col>
                  </Row>
                  <ImageUpload imageUrl={eventData?.image?.original} imageReadOnly={false} />
                </Form.Item>
                <Form.Item label={t('dashboard.events.addEditEvent.otherInformation.contact.title')}>
                  <Form.Item
                    label={t('dashboard.events.addEditEvent.otherInformation.contact.contactTitle')}
                    className="subheading-wrap">
                    <BilingualInput fieldData={eventData?.contactPoint?.name}>
                      <Form.Item name="frenchContactTitle" initialValue={eventData?.contactPoint?.name?.fr}>
                        <TextArea
                          autoSize
                          autoComplete="off"
                          placeholder={t(
                            'dashboard.events.addEditEvent.otherInformation.contact.placeHolderContactTitleFrench',
                          )}
                          style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                          size="large"
                        />
                      </Form.Item>
                      <Form.Item name="englishContactTitle" initialValue={eventData?.contactPoint?.name?.en}>
                        <TextArea
                          autoSize
                          autoComplete="off"
                          placeholder={t(
                            'dashboard.events.addEditEvent.otherInformation.contact.placeHolderContactTitleEnglish',
                          )}
                          style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                          size="large"
                        />
                      </Form.Item>
                    </BilingualInput>
                  </Form.Item>
                  <Form.Item
                    name="contactWebsiteUrl"
                    className="subheading-wrap"
                    label={t('dashboard.events.addEditEvent.otherInformation.contact.website')}
                    initialValue={eventData?.contactPoint?.url?.uri}
                    rules={[
                      {
                        type: 'url',
                        message: t('dashboard.events.addEditEvent.validations.url'),
                      },
                    ]}>
                    <StyledInput
                      addonBefore="https://"
                      autoComplete="off"
                      placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderWebsite')}
                    />
                  </Form.Item>
                  <Form.Item
                    name="contactPhoneNumber"
                    className="subheading-wrap"
                    label={t('dashboard.events.addEditEvent.otherInformation.contact.phoneNumber')}
                    initialValue={eventData?.contactPoint?.telephone}>
                    <StyledInput
                      placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderPhoneNumber')}
                    />
                  </Form.Item>
                  <Form.Item
                    name="contactEmail"
                    className="subheading-wrap"
                    label={t('dashboard.events.addEditEvent.otherInformation.contact.email')}
                    initialValue={eventData?.contactPoint?.email}
                    rules={[
                      {
                        type: 'email',
                        message: t('login.validations.invalidEmail'),
                      },
                    ]}>
                    <StyledInput
                      placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderEmail')}
                    />
                  </Form.Item>
                </Form.Item>
                <Form.Item
                  name="eventLink"
                  label={t('dashboard.events.addEditEvent.otherInformation.eventLink')}
                  initialValue={eventData?.url?.uri}
                  rules={[
                    {
                      type: 'url',
                      message: t('dashboard.events.addEditEvent.validations.url'),
                    },
                  ]}>
                  <StyledInput
                    addonBefore="https://"
                    autoComplete="off"
                    placeholder={t('dashboard.events.addEditEvent.otherInformation.placeHolderLinks')}
                  />
                </Form.Item>
                <Form.Item
                  name="videoLink"
                  label={t('dashboard.events.addEditEvent.otherInformation.videoLink')}
                  initialValue={eventData?.videoUrl}
                  rules={[
                    {
                      type: 'url',
                      message: t('dashboard.events.addEditEvent.validations.url'),
                    },
                  ]}>
                  <StyledInput
                    addonBefore="https://"
                    autoComplete="off"
                    placeholder={t('dashboard.events.addEditEvent.otherInformation.placeHolderLinks')}
                  />
                </Form.Item>
                <Form.Item
                  name="facebookLink"
                  label={t('dashboard.events.addEditEvent.otherInformation.facebookLink')}
                  initialValue={eventData?.facebookUrl}
                  rules={[
                    {
                      type: 'url',
                      message: t('dashboard.events.addEditEvent.validations.url'),
                    },
                  ]}>
                  <StyledInput
                    addonBefore="https://"
                    autoComplete="off"
                    placeholder={t('dashboard.events.addEditEvent.otherInformation.placeHolderLinks')}
                  />
                </Form.Item>
                <p className="add-event-date-heading">
                  {t('dashboard.events.addEditEvent.otherInformation.facebookLinkFooter')}
                </p>
              </>
            </CardEvent>
            <CardEvent title={t('dashboard.events.addEditEvent.eventAccessibility.title')}>
              <>
                <Form.Item
                  name="eventAccessibility"
                  label={t('dashboard.events.addEditEvent.eventAccessibility.title')}
                  initialValue={eventData?.accessibility?.map((type) => {
                    return type?.entityId;
                  })}>
                  <TreeSelectOption
                    allowClear
                    treeDefaultExpandAll
                    clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                    treeData={treeTaxonomyOptions(allTaxonomyData, user, 'EventAccessibility')}
                    tagRender={(props) => {
                      const { label, closable, onClose } = props;
                      return (
                        <Tags
                          closable={closable}
                          onClose={onClose}
                          closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                          {label}
                        </Tags>
                      );
                    }}
                  />
                </Form.Item>
                <Form.Item label={t('dashboard.events.addEditEvent.eventAccessibility.note')}>
                  <BilingualInput fieldData={eventData?.accessibilityNote}>
                    <Form.Item name="frenchAccessibilityNote" initialValue={eventData?.accessibilityNote?.fr}>
                      <TextArea
                        autoComplete="off"
                        placeholder={t(
                          'dashboard.events.addEditEvent.eventAccessibility.placeHolderEventAccessibilityFrenchNote',
                        )}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px', resize: 'vertical' }}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item name="englishAccessibilityNote" initialValue={eventData?.accessibilityNote?.en}>
                      <TextArea
                        autoComplete="off"
                        placeholder={t(
                          'dashboard.events.addEditEvent.eventAccessibility.placeHolderEventAccessibilityEnglishNote',
                        )}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px', resize: 'vertical' }}
                        size="large"
                      />
                    </Form.Item>
                  </BilingualInput>
                </Form.Item>
              </>
            </CardEvent>
          </Row>
        </Form>
      </div>
    )
  );
}

export default AddEvent;
