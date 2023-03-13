import React, { useEffect, useState, useRef } from 'react';
import './addEvent.css';
import { Form, Row, Col, Input, Popover, message, Button, Modal, Space } from 'antd';
import {
  SyncOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  ControlOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import Calendar from 'rc-year-calendar';
import moment from 'moment';
import i18n from 'i18next';
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
import { dateFrequencyOptions, dateTypeOptions, dateTypes } from '../../../constants/dateTypes';
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
import {
  treeDynamicTaxonomyOptions,
  treeEntitiesOption,
  treeTaxonomyOptions,
} from '../../../components/TreeSelectOption/treeSelectOption.settings';
import StyledInput from '../../../components/Input/Common';
import SelectOption from '../../../components/Select/SelectOption';
import { urlProtocolCheck } from '../../../components/Input/Common/input.settings';
import { offerTypeOptions, offerTypes } from '../../../constants/ticketOffers';
import { ReactComponent as Money } from '../../../assets/icons/Money.svg';
import { ReactComponent as MoneyFree } from '../../../assets/icons/Money-Free.svg';
import TicketPrice from '../../../components/TicketPrice';
import { useGetAllPlacesQuery } from '../../../services/places';
import { placesOptions } from '../../../components/Select/selectOption.settings';
import { useGetEntitiesQuery, useLazyGetEntitiesQuery } from '../../../services/entities';
import { entitiesClass } from '../../../constants/entitiesClass';
import SelectionItem from '../../../components/List/SelectionItem';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import NoContent from '../../../components/NoContent/NoContent';
import { locationType, locationTypeOptions, virtualLocationFieldNames } from '../../../constants/locationTypeOptions';
import { otherInformationFieldNames, otherInformationOptions } from '../../../constants/otherInformationOptions';
import { eventAccessibilityFieldNames, eventAccessibilityOptions } from '../../../constants/eventAccessibilityOptions';
import { usePrompt } from '../../../hooks/usePrompt';
import { bilingual } from '../../../utils/bilingual';
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
  const [getEntities] = useLazyGetEntitiesQuery({ sessionId: timestampRef });
  const [updateEventState] = useUpdateEventStateMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [addImage] = useAddImageMutation();

  const [dateType, setDateType] = useState();
  const [ticketType, setTicketType] = useState();
  const [organizersList, setOrganizersList] = useState([]);
  const [performerList, setPerformerList] = useState([]);
  const [supporterList, setSupporterList] = useState([]);
  const [allPlacesList, setAllPlacesList] = useState([]);
  const [locationPlace, setLocationPlace] = useState();
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [selectedPerformers, setSelectedPerformers] = useState([]);
  const [selectedSupporters, setSelectedSupporters] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState({
    locationPlace: false,
    organizer: false,
    performer: false,
    supporter: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addedFields, setAddedFields] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [scrollToSelectedField, setSrollToSelectedField] = useState();

  usePrompt(t('common.unsavedChanges'), showDialog);

  const reactQuillRefFr = useRef(null);
  const reactQuillRefEn = useRef(null);

  let initialVirtualLocation = eventData?.locations?.filter((location) => location.isVirtualLocation == true);
  let initialPlace = eventData?.locations?.filter((location) => location.isVirtualLocation == false);
  const dateTimeConverter = (date, time) => {
    let dateSelected = moment(date).format('DD/MM/YYYY');
    let timeSelected = moment(time).format('hh:mm:ss a');
    let dateTime = moment(dateSelected + ' ' + timeSelected, 'DD/MM/YYYY HH:mm a');
    return moment(dateTime).toISOString();
  };
  const addUpdateEventApiHandler = (eventObj) => {
    var promise = new Promise(function (resolve, reject) {
      if (!eventId || eventId === '') {
        addEvent({
          data: eventObj,
          calendarId,
        })
          .unwrap()
          .then(() => {
            resolve();
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);
          })
          .catch((errorInfo) => {
            reject();
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
            resolve();
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);
          })
          .catch((error) => {
            reject();
            console.log(error);
          });
      }
    });
    return promise;
  };
  const saveAsDraftHandler = (event) => {
    event?.preventDefault();
    setShowDialog(false);
    var promise = new Promise(function (resolve, reject) {
      form
        .validateFields([
          'french',
          'english',
          'datePicker',
          'dateRangePicker',
          'datePickerWrapper',
          ...(eventData?.publishState === eventPublishState.PUBLISHED ? ['prices', 'ticketLink'] : []),
        ])
        .then(() => {
          var values = form.getFieldsValue(true);
          var startDateTime,
            endDateTime,
            additionalType = [],
            audience = [],
            contactPoint,
            accessibility = [],
            accessibilityNote,
            keywords,
            locationId,
            offerConfiguration,
            organizers = [],
            performers = [],
            collaborators = [],
            dynamicFields = [],
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
          if (values?.locationPlace || values?.locationPlace?.length > 0) {
            locationId = {
              place: {
                entityId: values?.locationPlace,
              },
            };
          }
          if (values?.frenchVirtualLocation || values?.englishVirtualLocation || values?.virtualLocationOnlineLink) {
            locationId = {
              ...locationId,
              virtualLocation: {
                name: {
                  en: values?.englishVirtualLocation,
                  fr: values?.frenchVirtualLocation,
                },
                description: {},
                dynamicFields: [],
                url: {
                  uri: urlProtocolCheck(values?.virtualLocationOnlineLink),
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
          if (values?.keywords?.length) {
            keywords = values?.keywords;
          }
          if (ticketType) {
            offerConfiguration = {
              category: ticketType,
              //Change name key to note when the change is made in the backend
              name: {
                en: values?.englishTicketNote,
                fr: values?.frenchTicketNote,
              },
              ...(ticketType === offerTypes.PAYING &&
                values?.prices?.length > 0 &&
                values?.prices[0] && {
                  prices: values?.prices,
                }),
              priceCurrency: 'CAD',
              ...(ticketType === offerTypes.PAYING &&
                values?.ticketLink && {
                  url: {
                    uri: urlProtocolCheck(values?.ticketLink),
                  },
                }),
            };
          }

          if (values?.organizers) {
            organizers = values?.organizers?.map((organizer) => {
              return {
                entityId: organizer?.value,
                type: organizer?.type,
              };
            });
          }

          if (values?.performers) {
            performers = values?.performers?.map((performer) => {
              return {
                entityId: performer?.value,
                type: performer?.type,
              };
            });
          }

          if (values?.supporters) {
            collaborators = values?.supporters?.map((supporter) => {
              return {
                entityId: supporter?.value,
                type: supporter?.type,
              };
            });
          }

          if (values?.dynamicFields) {
            dynamicFields = Object.keys(values?.dynamicFields)?.map((dynamicField) => {
              return {
                taxonomyId: dynamicField,
                conceptIds: values?.dynamicFields[dynamicField],
              };
            });
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
            ...(keywords && { keywords }),
            ...(ticketType && { offerConfiguration }),
            ...(values?.organizers && { organizers }),
            ...(values?.performers && { performers }),
            ...(values?.supporters && { collaborators }),
            ...(values?.dynamicFields && { dynamicFields }),
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
                      addUpdateEventApiHandler(eventObj)
                        .then(() => resolve())
                        .catch((error) => {
                          reject();
                          console.log(error);
                        });
                    })
                    .catch((error) => {
                      console.log(error);
                    });
              },
            });
          } else {
            if (values?.dragger && values?.length == 0) eventObj['image'] = null;
            addUpdateEventApiHandler(eventObj)
              .then(() => resolve())
              .catch((error) => {
                reject();
                console.log(error);
              });
          }
        })
        .catch((error) => {
          console.log(error);
          message.warning({
            duration: 10,
            maxCount: 1,
            key: 'event-save-as-warning',
            content: (
              <>
                {t('dashboard.events.addEditEvent.validations.errorDraft')} &nbsp;
                <Button
                  type="text"
                  icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
                  onClick={() => message.destroy('event-save-as-warning')}
                />
              </>
            ),
            icon: <ExclamationCircleOutlined />,
          });
        });
    });

    return promise;
  };

  const reviewPublishHandler = (event) => {
    event?.preventDefault();
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
        'ticketPickerWrapper',
        'prices',
        'ticketLink',
      ])
      .then(() => {
        saveAsDraftHandler(event)
          .then(() => {
            updateEventState({ id: eventId, calendarId })
              .unwrap()
              .then(() =>
                navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`).catch((error) => console.log(error)),
              );
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => {
        console.log(error);
        const calendar = user?.roles.filter((calendar) => {
          return calendar.calendarId === calendarId;
        });

        message.warning({
          duration: 10,
          maxCount: 1,
          key: 'event-review-publish-warning',
          content: (
            <>
              {calendar[0]?.role === userRoles.GUEST
                ? t('dashboard.events.addEditEvent.validations.errorReview')
                : t('dashboard.events.addEditEvent.validations.errorPublishing')}
              &nbsp;
              <Button
                type="text"
                icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
                onClick={() => message.destroy('event-review-publish-warning')}
              />
            </>
          ),
          icon: <ExclamationCircleOutlined />,
        });
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
            <Outlined
              size="large"
              label={t('dashboard.events.addEditEvent.saveOptions.saveAsDraft')}
              onClick={(e) => saveAsDraftHandler(e)}
            />
          </Form.Item>
          <Form.Item>
            <PrimaryButton
              label={t('dashboard.events.addEditEvent.saveOptions.publish')}
              onClick={(e) => reviewPublishHandler(e)}
            />
          </Form.Item>
        </>
      );
    else
      return (
        <>
          <Form.Item>
            <Outlined
              size="large"
              label={t('dashboard.events.addEditEvent.saveOptions.saveAsDraft')}
              onClick={(e) => saveAsDraftHandler(e)}
            />
          </Form.Item>

          <Form.Item>
            <PrimaryButton
              label={t('dashboard.events.addEditEvent.saveOptions.sendToReview')}
              onClick={(e) => reviewPublishHandler(e)}
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
              label={t('dashboard.events.addEditEvent.saveOptions.save')}
              onClick={(e) => saveAsDraftHandler(e)}
            />
          </Form.Item>
        </>
      );
    else return roleCheckHandler();
  };

  const placesSearch = (inputValue) => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.place);
    getEntities({ searchKey: inputValue, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        setAllPlacesList(placesOptions(response, user));
      })
      .catch((error) => console.log(error));
  };

  const organizationPersonSearch = (value, type) => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.organization);
    query.append('classes', entitiesClass.person);
    getEntities({ searchKey: value, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        if (type == 'organizers') {
          setOrganizersList(treeEntitiesOption(response, user));
        } else if (type == 'performers') {
          setPerformerList(treeEntitiesOption(response, user));
        } else if (type == 'supporters') {
          setSupporterList(treeEntitiesOption(response, user));
        }
      })
      .catch((error) => console.log(error));
  };
  useEffect(() => {
    if (addedFields?.length > 0) {
      const element = document.getElementsByClassName(scrollToSelectedField);
      element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [addedFields]);

  const addFieldsHandler = (fieldNames) => {
    let array = addedFields?.concat(fieldNames);
    array = [...new Set(array)];
    setAddedFields(array);
    setSrollToSelectedField(array?.at(-1));
  };
  const onValuesChangHandler = () => {
    setShowDialog(true);
  };

  useEffect(() => {
    if (selectedOrganizers) form.setFieldValue('organizers', selectedOrganizers);
  }, [selectedOrganizers]);

  useEffect(() => {
    if (selectedPerformers) form.setFieldValue('performers', selectedPerformers);
  }, [selectedPerformers]);

  useEffect(() => {
    if (selectedSupporters) form.setFieldValue('supporters', selectedSupporters);
  }, [selectedSupporters]);

  useEffect(() => {
    if (calendarId && eventData) {
      let initialAddedFields = [];
      if (routinghandler(user, calendarId, eventData?.creator?.userId, eventData?.publishState)) {
        setDateType(
          dateTimeTypeHandler(
            eventData?.startDate,
            eventData?.startDateTime,
            eventData?.endDate,
            eventData?.endDateTime,
          ),
        );
        setTicketType(eventData?.offerConfiguration?.category);
        if (initialPlace && initialPlace?.length > 0) setLocationPlace(placesOptions(initialPlace)[0]);
        if (eventData?.locations?.filter((location) => location?.isVirtualLocation == true)?.length > 0)
          initialAddedFields = initialAddedFields?.concat(locationType?.fieldNames);
        if (
          eventData?.contactPoint?.email ||
          eventData?.contactPoint?.telephone ||
          eventData?.contactPoint?.url?.uri ||
          eventData?.contactPoint?.name?.fr ||
          eventData?.contactPoint?.name?.en
        )
          initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.contact);
        if (eventData?.organizer) {
          let initialOrganizers = eventData?.organizer?.map((organizer) => {
            return {
              disambiguatingDescription: organizer?.entity?.disambiguatingDescription,
              id: organizer?.entityId,
              name: organizer?.entity?.name,
              type: organizer?.type,
            };
          });
          setSelectedOrganizers(treeEntitiesOption(initialOrganizers, user));
        }
        if (eventData?.performer) {
          let initialPerformers = eventData?.performer?.map((performer) => {
            return {
              disambiguatingDescription: performer?.entity?.disambiguatingDescription,
              id: performer?.entityId,
              name: performer?.entity?.name,
              type: performer?.type,
            };
          });
          setSelectedPerformers(treeEntitiesOption(initialPerformers, user));
          initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.performerWrap);
        }
        if (eventData?.collaborators) {
          let initialSupporters = eventData?.collaborators?.map((supporter) => {
            return {
              disambiguatingDescription: supporter?.entity?.disambiguatingDescription,
              id: supporter?.entityId,
              name: supporter?.entity?.name,
              type: supporter?.type,
            };
          });
          setSelectedSupporters(treeEntitiesOption(initialSupporters, user));
          initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.supporterWrap);
        }
        if (eventData?.url?.uri) initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.eventLink);
        if (eventData?.videoUrl) initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.videoLink);
        if (eventData?.facebookUrl)
          initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.facebookLinkWrap);
        if (eventData?.keywords) initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.keywords);
        if (eventData?.accessibilityNote?.en || eventData?.accessibilityNote?.fr)
          initialAddedFields = initialAddedFields?.concat(eventAccessibilityFieldNames?.noteWrap);
        setAddedFields(initialAddedFields);
      } else
        window.location.replace(`${location?.origin}${PathName.Dashboard}/${calendarId}${PathName.Events}/${eventId}`);
    }
  }, [isLoading]);

  useEffect(() => {
    setOrganizersList(treeEntitiesOption(initialEntities, user));
    setPerformerList(treeEntitiesOption(initialEntities, user));
    setSupporterList(treeEntitiesOption(initialEntities, user));
  }, [initialEntityLoading]);

  useEffect(() => {
    setAllPlacesList(placesOptions(allPlaces?.data, user));
  }, [placesLoading]);

  return (
    !isLoading &&
    !placesLoading &&
    !taxonomyLoading &&
    !initialEntityLoading && (
      <div>
        <Form form={form} layout="vertical" name="event" onValuesChange={onValuesChangHandler}>
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
                    notFoundContent={<NoContent />}
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
                    notFoundContent={<NoContent />}
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
                {allTaxonomyData?.data?.map((taxonomy, index) => {
                  if (taxonomy?.isDynamicField) {
                    let initialValues;
                    eventData?.dynamicFields?.forEach((dynamicField) => {
                      if (taxonomy?.id === dynamicField?.taxonomyId) initialValues = dynamicField?.conceptIds;
                    });
                    return (
                      <Form.Item
                        key={index}
                        name={['dynamicFields', taxonomy?.id]}
                        label={bilingual({
                          en: taxonomy?.name?.en,
                          fr: taxonomy?.name?.fr,
                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                        })}
                        initialValue={initialValues}>
                        <TreeSelectOption
                          allowClear
                          treeDefaultExpandAll
                          notFoundContent={<NoContent />}
                          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                          treeData={treeDynamicTaxonomyOptions(taxonomy?.concept, user)}
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
                    );
                  }
                })}
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
                        {dateType === dateTypes.MULTIPLE && (
                          <>
                            <Form.Item
                              // name="dateRangePicker"
                              label={t('dashboard.events.addEditEvent.dates.multipleDates')}
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
                              rules={[
                                { required: true, message: t('dashboard.events.addEditEvent.validations.date') },
                              ]}>
                              <DateRangePicker style={{ width: '423px' }} />
                              {console.log(moment.localeData('fr').weekdaysShort())}
                            </Form.Item>
                          </>
                        )}
                      </Col>
                    </Row>
                    <Row justify="space-between">
                      <Col flex={'203.5px'}>
                        <Form.Item
                          name="startTime"
                          label={t('dashboard.events.addEditEvent.dates.startTime')}
                          initialValue={eventData?.startDateTime ? moment(eventData?.startDateTime) : undefined}>
                          <TimePickerStyled
                            placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                            use12Hours={i18n?.language === 'en' ? true : false}
                            format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                          />
                        </Form.Item>
                      </Col>
                      <Col flex={'203.5px'}>
                        <Form.Item
                          name="endTime"
                          label={t('dashboard.events.addEditEvent.dates.endTime')}
                          initialValue={eventData?.endDateTime ? moment(eventData?.endDateTime) : undefined}>
                          <TimePickerStyled
                            placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                            use12Hours={i18n?.language === 'en' ? true : false}
                            format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col flex={'423px'}>
                        <Form.Item
                          name="eventFrequency"
                          label={t('dashboard.events.addEditEvent.dates.frequency')}
                          // initialValue={eventData?.eventStatus ?? eventStatus.EventScheduled}
                        >
                          <Select options={dateFrequencyOptions} />
                        </Form.Item>
                        <Form.Item name="eventFrequency" label={t('dashboard.events.addEditEvent.dates.days')}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {moment
                              .localeData('fr')
                              .weekdaysShort()
                              ?.map((day, index) => (
                                <Button
                                  key={index}
                                  className="recurring-day-buttons"
                                  onClick={(e) => console.log(e)}
                                  // style={{ borderColor: '#607EFC' }}
                                >
                                  {day}
                                </Button>
                              ))}
                          </div>
                        </Form.Item>
                        <Form.Item>
                          <Button type="text" icon={<ControlOutlined />} onClick={() => setIsModalOpen(true)}>
                            Customize
                          </Button>
                          <Modal
                            title="Basic Modal"
                            open={isModalOpen}
                            onOk={() => setIsModalOpen(false)}
                            onCancel={() => setIsModalOpen(false)}>
                            <div>
                              <div>
                                <Calendar />
                              </div>
                              <div>
                                <Form.List name="users">
                                  {(fields, { add, remove }) => (
                                    <>
                                      {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                          <Form.Item
                                            {...restField}
                                            name={[name, 'first']}
                                            rules={[{ required: true, message: 'Missing first name' }]}>
                                            <Input placeholder="First Name" />
                                          </Form.Item>
                                          <Form.Item
                                            {...restField}
                                            name={[name, 'last']}
                                            rules={[{ required: true, message: 'Missing last name' }]}>
                                            <Input placeholder="Last Name" />
                                          </Form.Item>
                                          <MinusCircleOutlined onClick={() => remove(name)} />
                                        </Space>
                                      ))}
                                      <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                          Add field
                                        </Button>
                                      </Form.Item>
                                    </>
                                  )}
                                </Form.List>
                              </div>
                            </div>
                          </Modal>
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
                            iconrender={<CalendarOutlined />}
                            label={t('dashboard.events.addEditEvent.dates.singleDate')}
                            onClick={() => setDateType(dateTypes.SINGLE)}
                          />
                          <DateAction
                            iconrender={<CalendarOutlined />}
                            label={t('dashboard.events.addEditEvent.dates.dateRange')}
                            onClick={() => setDateType(dateTypes.RANGE)}
                          />
                          <DateAction
                            iconrender={<CalendarOutlined />}
                            label={t('dashboard.events.addEditEvent.dates.multipleDates')}
                            onClick={() => setDateType(dateTypes.MULTIPLE)}
                          />
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
                <Form.Item
                  label={t('dashboard.events.addEditEvent.dates.changeDateType')}
                  style={{ lineHeight: '2.5' }}>
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
                        getFieldValue('virtualLocationOnlineLink') ||
                        getFieldValue('locationPlace')
                      ) {
                        return Promise.resolve();
                      } else return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.location')));
                    },
                  }),
                ]}>
                <Form.Item
                  name="locationPlace"
                  className="subheading-wrap"
                  initialValue={initialPlace && initialPlace[0]?.id}
                  label={t('dashboard.events.addEditEvent.location.title')}>
                  <Popover
                    open={isPopoverOpen.locationPlace}
                    onOpenChange={(open) => setIsPopoverOpen({ ...isPopoverOpen, locationPlace: open })}
                    overlayClassName="event-popover"
                    placement="bottom"
                    autoAdjustOverflow={false}
                    getPopupContainer={(trigger) => trigger.parentNode}
                    trigger={['click']}
                    content={
                      allPlacesList?.length > 0 ? (
                        allPlacesList?.map((place, index) => (
                          <div
                            key={index}
                            className={`event-popover-options ${
                              locationPlace?.value == place?.value ? 'event-popover-options-active' : null
                            }`}
                            onClick={() => {
                              setLocationPlace(place);
                              form.setFieldValue('locationPlace', place?.value);
                              setIsPopoverOpen({
                                ...isPopoverOpen,
                                locationPlace: false,
                              });
                            }}>
                            {place?.label}
                          </div>
                        ))
                      ) : (
                        <NoContent />
                      )
                    }>
                    <EventsSearch
                      style={{ borderRadius: '4px', width: '423px' }}
                      placeholder={t('dashboard.events.addEditEvent.location.placeHolderLocation')}
                      onChange={(e) => {
                        placesSearch(e.target.value);
                        setIsPopoverOpen({ ...isPopoverOpen, locationPlace: true });
                      }}
                      onClick={() => setIsPopoverOpen({ ...isPopoverOpen, locationPlace: true })}
                    />
                  </Popover>
                  {locationPlace && (
                    <SelectionItem
                      icon={locationPlace?.label?.props?.icon}
                      name={locationPlace?.name}
                      description={locationPlace?.description}
                      itemWidth="100%"
                      bordered
                      closable
                      onClose={() => {
                        setLocationPlace();
                        form.setFieldValue('locationPlace', undefined);
                      }}
                    />
                  )}
                </Form.Item>
                <Form.Item
                  label={t('dashboard.events.addEditEvent.location.virtualLocation')}
                  name={virtualLocationFieldNames.virtualLocationName}
                  className={virtualLocationFieldNames.virtualLocationName}
                  style={{ display: !addedFields?.includes(virtualLocationFieldNames.virtualLocationName) && 'none' }}>
                  <BilingualInput fieldData={initialVirtualLocation && initialVirtualLocation[0]?.name}>
                    <Form.Item
                      name="frenchVirtualLocation"
                      initialValue={initialVirtualLocation && initialVirtualLocation[0]?.name?.fr}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.location.placeHolderVirtualLocationFr')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name="englishVirtualLocation"
                      initialValue={initialVirtualLocation && initialVirtualLocation[0]?.name?.en}>
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
                  name={virtualLocationFieldNames.virtualLocationOnlineLink}
                  style={{
                    display: !addedFields?.includes(virtualLocationFieldNames.virtualLocationOnlineLink) && 'none',
                  }}
                  className={`subheading-wrap ${virtualLocationFieldNames.virtualLocationOnlineLink}`}
                  label={t('dashboard.events.addEditEvent.location.onlineLink')}
                  initialValue={initialVirtualLocation && initialVirtualLocation[0]?.url?.uri}
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

              <Form.Item label={t('dashboard.events.addEditEvent.addMoreDetails')} style={{ lineHeight: '2.5' }}>
                {addedFields?.includes(virtualLocationFieldNames.virtualLocationOnlineLink) &&
                addedFields?.includes(virtualLocationFieldNames.virtualLocationName) ? (
                  <NoContent label={t('dashboard.events.addEditEvent.allDone')} />
                ) : (
                  locationTypeOptions.map((type) => {
                    return (
                      <ChangeType
                        key={type.type}
                        primaryIcon={<PlusOutlined />}
                        disabled={type.disabled}
                        label={type.label}
                        promptText={type.tooltip}
                        secondaryIcon={<InfoCircleOutlined />}
                        onClick={() => addFieldsHandler(type?.fieldNames)}
                      />
                    );
                  })
                )}
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
                      editorLanguage={'fr'}
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
                      editorLanguage={'en'}
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
                  required
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
                <Form.Item label={t('dashboard.events.addEditEvent.otherInformation.organizer.title')}>
                  <Row>
                    <Col>
                      <p className="add-event-date-heading">
                        {t('dashboard.events.addEditEvent.otherInformation.organizer.subHeading')}
                      </p>
                    </Col>
                  </Row>
                  <Form.Item name="organizers" initialValue={selectedOrganizers}>
                    <Popover
                      open={isPopoverOpen.organizer}
                      onOpenChange={(open) => setIsPopoverOpen({ ...isPopoverOpen, organizer: open })}
                      overlayClassName="event-popover"
                      placement="bottom"
                      autoAdjustOverflow={false}
                      getPopupContainer={(trigger) => trigger.parentNode}
                      trigger={['click']}
                      content={
                        organizersList?.length > 0 ? (
                          organizersList?.map((organizer, index) => (
                            <div
                              key={index}
                              className="event-popover-options"
                              onClick={() => {
                                setSelectedOrganizers([...selectedOrganizers, organizer]);
                                setIsPopoverOpen({
                                  ...isPopoverOpen,
                                  organizer: false,
                                });
                              }}>
                              {organizer?.label}
                            </div>
                          ))
                        ) : (
                          <NoContent />
                        )
                      }>
                      <EventsSearch
                        style={{ borderRadius: '4px' }}
                        placeholder={t('dashboard.events.addEditEvent.otherInformation.organizer.searchPlaceholder')}
                        onChange={(e) => {
                          organizationPersonSearch(e.target.value, 'organizers');
                          setIsPopoverOpen({ ...isPopoverOpen, organizer: true });
                        }}
                        onClick={() => setIsPopoverOpen({ ...isPopoverOpen, organizer: true })}
                      />
                    </Popover>

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
                        />
                      );
                    })}
                  </Form.Item>
                </Form.Item>
                <Form.Item
                  label={t('dashboard.events.addEditEvent.otherInformation.contact.title')}
                  className={otherInformationFieldNames.contact}
                  name={otherInformationFieldNames.contact}
                  style={{
                    display: !addedFields?.includes(otherInformationFieldNames.contact) && 'none',
                  }}>
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
                  label={t('dashboard.events.addEditEvent.otherInformation.performer.title')}
                  name={otherInformationFieldNames.performerWrap}
                  className={otherInformationFieldNames.performerWrap}
                  style={{
                    display: !addedFields?.includes(otherInformationFieldNames.performerWrap) && 'none',
                  }}>
                  <Row>
                    <Col>
                      <p className="add-event-date-heading">
                        {t('dashboard.events.addEditEvent.otherInformation.performer.subHeading')}
                      </p>
                    </Col>
                  </Row>
                  <Form.Item name="performers" initialValue={selectedPerformers}>
                    <Popover
                      open={isPopoverOpen.performer}
                      onOpenChange={(open) => setIsPopoverOpen({ ...isPopoverOpen, performer: open })}
                      overlayClassName="event-popover"
                      placement="bottom"
                      autoAdjustOverflow={false}
                      trigger={['click']}
                      getPopupContainer={(trigger) => trigger.parentNode}
                      content={
                        performerList?.length > 0 ? (
                          performerList?.map((performer, index) => (
                            <div
                              key={index}
                              className="event-popover-options"
                              onClick={() => {
                                setSelectedPerformers([...selectedPerformers, performer]);
                                setIsPopoverOpen({
                                  ...isPopoverOpen,
                                  performer: false,
                                });
                              }}>
                              {performer?.label}
                            </div>
                          ))
                        ) : (
                          <NoContent />
                        )
                      }>
                      <EventsSearch
                        style={{ borderRadius: '4px' }}
                        placeholder={t('dashboard.events.addEditEvent.otherInformation.performer.searchPlaceholder')}
                        onChange={(e) => {
                          organizationPersonSearch(e.target.value, 'performers');
                          setIsPopoverOpen({ ...isPopoverOpen, performer: true });
                        }}
                        onClick={() => setIsPopoverOpen({ ...isPopoverOpen, performer: true })}
                      />
                    </Popover>

                    {selectedPerformers?.map((performer, index) => {
                      return (
                        <SelectionItem
                          key={index}
                          icon={performer?.label?.props?.icon}
                          name={performer?.name}
                          description={performer?.description}
                          bordered
                          closable
                          itemWidth="100%"
                          onClose={() => {
                            setSelectedPerformers(
                              selectedPerformers?.filter((selectedPerformer, indexValue) => indexValue != index),
                            );
                          }}
                        />
                      );
                    })}
                  </Form.Item>
                </Form.Item>
                <Form.Item
                  label={t('dashboard.events.addEditEvent.otherInformation.supporter.title')}
                  name={otherInformationFieldNames.supporterWrap}
                  className={otherInformationFieldNames.supporterWrap}
                  style={{
                    display: !addedFields?.includes(otherInformationFieldNames.supporterWrap) && 'none',
                  }}>
                  <Row>
                    <Col>
                      <p className="add-event-date-heading">
                        {t('dashboard.events.addEditEvent.otherInformation.supporter.subHeading')}
                      </p>
                    </Col>
                  </Row>
                  <Form.Item name="supporters" initialValue={selectedSupporters}>
                    <Popover
                      open={isPopoverOpen.supporter}
                      onOpenChange={(open) => setIsPopoverOpen({ ...isPopoverOpen, supporter: open })}
                      overlayClassName="event-popover"
                      placement="bottom"
                      autoAdjustOverflow={false}
                      trigger={['click']}
                      getPopupContainer={(trigger) => trigger.parentNode}
                      content={
                        supporterList?.length > 0 ? (
                          supporterList?.map((supporter, index) => (
                            <div
                              key={index}
                              className="event-popover-options"
                              onClick={() => {
                                setSelectedSupporters([...selectedSupporters, supporter]);
                                setIsPopoverOpen({
                                  ...isPopoverOpen,
                                  supporter: false,
                                });
                              }}>
                              {supporter?.label}
                            </div>
                          ))
                        ) : (
                          <NoContent />
                        )
                      }>
                      <EventsSearch
                        style={{ borderRadius: '4px' }}
                        placeholder={t('dashboard.events.addEditEvent.otherInformation.supporter.searchPlaceholder')}
                        onChange={(e) => {
                          organizationPersonSearch(e.target.value, 'supporters');
                          setIsPopoverOpen({ ...isPopoverOpen, supporter: true });
                        }}
                        onClick={() => setIsPopoverOpen({ ...isPopoverOpen, supporter: true })}
                      />
                    </Popover>

                    {selectedSupporters?.map((supporter, index) => {
                      return (
                        <SelectionItem
                          key={index}
                          icon={supporter?.label?.props?.icon}
                          name={supporter?.name}
                          description={supporter?.description}
                          bordered
                          itemWidth="100%"
                          closable
                          onClose={() => {
                            setSelectedSupporters(
                              selectedSupporters?.filter((selectedSupporter, indexValue) => indexValue != index),
                            );
                          }}
                        />
                      );
                    })}
                  </Form.Item>
                </Form.Item>
                <Form.Item
                  name={otherInformationFieldNames.eventLink}
                  className={otherInformationFieldNames.eventLink}
                  style={{
                    display: !addedFields?.includes(otherInformationFieldNames.eventLink) && 'none',
                  }}
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
                  name={otherInformationFieldNames.videoLink}
                  className={otherInformationFieldNames.videoLink}
                  style={{
                    display: !addedFields?.includes(otherInformationFieldNames.videoLink) && 'none',
                  }}
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
                  name={otherInformationFieldNames.facebookLinkWrap}
                  className={otherInformationFieldNames.facebookLinkWrap}
                  style={{
                    display: !addedFields?.includes(otherInformationFieldNames.facebookLinkWrap) && 'none',
                  }}>
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
                </Form.Item>
                <Form.Item
                  name={otherInformationFieldNames.keywords}
                  className={otherInformationFieldNames.keywords}
                  style={{
                    display: !addedFields?.includes(otherInformationFieldNames.keywords) && 'none',
                  }}
                  label={t('dashboard.events.addEditEvent.otherInformation.keywords')}
                  initialValue={eventData?.keywords}>
                  <SelectOption
                    mode="tags"
                    allowClear
                    placeholder={t('dashboard.events.addEditEvent.otherInformation.placeHolderKeywords')}
                    clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                    open={false}
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
              </>
              <Form.Item label={t('dashboard.events.addEditEvent.addMoreDetails')} style={{ lineHeight: '2.5' }}>
                {addedFields?.includes(otherInformationFieldNames.contact) &&
                addedFields?.includes(otherInformationFieldNames.performerWrap) &&
                addedFields?.includes(otherInformationFieldNames.supporterWrap) &&
                addedFields?.includes(otherInformationFieldNames.eventLink) &&
                addedFields?.includes(otherInformationFieldNames.videoLink) &&
                addedFields?.includes(otherInformationFieldNames.facebookLinkWrap) &&
                addedFields?.includes(otherInformationFieldNames.keywords) ? (
                  <NoContent label={t('dashboard.events.addEditEvent.allDone')} />
                ) : (
                  otherInformationOptions.map((type) => {
                    if (!addedFields?.includes(type.fieldNames))
                      return (
                        <ChangeType
                          key={type.type}
                          primaryIcon={<PlusOutlined />}
                          disabled={type.disabled}
                          label={type.label}
                          promptText={type.tooltip}
                          secondaryIcon={<InfoCircleOutlined />}
                          onClick={() => addFieldsHandler(type?.fieldNames)}
                        />
                      );
                  })
                )}
              </Form.Item>
            </CardEvent>
            <CardEvent title={t('dashboard.events.addEditEvent.eventAccessibility.title')}>
              <>
                <Form.Item
                  name="eventAccessibility"
                  className="eventAccessibility"
                  label={t('dashboard.events.addEditEvent.eventAccessibility.title')}
                  initialValue={eventData?.accessibility?.map((type) => {
                    return type?.entityId;
                  })}>
                  <TreeSelectOption
                    allowClear
                    treeDefaultExpandAll
                    style={{ width: '423px' }}
                    notFoundContent={<NoContent />}
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
                <Form.Item
                  label={t('dashboard.events.addEditEvent.eventAccessibility.note')}
                  name={eventAccessibilityFieldNames.noteWrap}
                  className={eventAccessibilityFieldNames.noteWrap}
                  style={{
                    display: !addedFields?.includes(eventAccessibilityFieldNames.noteWrap) && 'none',
                  }}>
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
              <Form.Item label={t('dashboard.events.addEditEvent.addMoreDetails')} style={{ lineHeight: '2.5' }}>
                {addedFields?.includes(eventAccessibilityFieldNames.noteWrap) ? (
                  <NoContent label={t('dashboard.events.addEditEvent.allDone')} />
                ) : (
                  eventAccessibilityOptions.map((type) => {
                    if (!addedFields?.includes(type.fieldNames))
                      return (
                        <ChangeType
                          key={type.type}
                          primaryIcon={<PlusOutlined />}
                          disabled={type.disabled}
                          label={type.label}
                          promptText={type.tooltip}
                          secondaryIcon={<InfoCircleOutlined />}
                          onClick={() => addFieldsHandler(type?.fieldNames)}
                        />
                      );
                  })
                )}
              </Form.Item>
            </CardEvent>
            <CardEvent title={t('dashboard.events.addEditEvent.tickets.title')} required={true}>
              <>
                {(ticketType == offerTypes.FREE || !ticketType) && (
                  <Row>
                    <Col flex={'423px'}>
                      <Form.Item
                        name="ticketPickerWrapper"
                        rules={[
                          ({ getFieldValue }) => ({
                            validator() {
                              if (
                                ticketType == offerTypes.FREE ||
                                (ticketType == offerTypes.PAYING &&
                                  (getFieldValue('ticketLink') || getFieldValue('prices')))
                              ) {
                                return Promise.resolve();
                              } else
                                return Promise.reject(
                                  new Error(t('dashboard.events.addEditEvent.validations.ticket.emptyTicket')),
                                );
                            },
                          }),
                        ]}>
                        <div className="ticket-buttons">
                          <DateAction
                            style={{ width: '200px', backgroundColor: ticketType == offerTypes.FREE && '#EFF2FF' }}
                            iconrender={<MoneyFree />}
                            label={t('dashboard.events.addEditEvent.tickets.free')}
                            onClick={() => setTicketType(offerTypes.FREE)}
                          />
                          <DateAction
                            iconrender={<Money />}
                            style={{ width: '200px' }}
                            label={t('dashboard.events.addEditEvent.tickets.paid')}
                            onClick={() => setTicketType(offerTypes.PAYING)}
                          />
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                {ticketType == offerTypes.PAYING && (
                  <>
                    <Form.Item
                      name="ticketLink"
                      label={t('dashboard.events.addEditEvent.tickets.buyTicketLink')}
                      initialValue={eventData?.offerConfiguration?.url?.uri}
                      rules={[
                        {
                          type: 'url',
                          message: t('dashboard.events.addEditEvent.validations.url'),
                        },

                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              (getFieldValue('prices') != undefined &&
                                getFieldValue('prices')?.length > 0 &&
                                getFieldValue('prices')[0] != undefined &&
                                getFieldValue('prices')[0].price != '') ||
                              value
                            ) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(
                                new Error(t('dashboard.events.addEditEvent.validations.ticket.emptyPaidTicket')),
                              );
                          },
                        }),
                      ]}>
                      <StyledInput
                        addonBefore="https://"
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.tickets.placeHolderLinks')}
                      />
                    </Form.Item>
                    <BilingualInput>
                      <Form.List
                        name="prices"
                        initialValue={eventData?.offerConfiguration?.prices}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator() {
                              if (
                                (getFieldValue('prices') != undefined &&
                                  getFieldValue('prices')?.length > 0 &&
                                  getFieldValue('prices')[0] != undefined &&
                                  getFieldValue('prices')[0].price != '') ||
                                getFieldValue('ticketLink')
                              ) {
                                return Promise.resolve();
                              } else
                                return Promise.reject(
                                  new Error(t('dashboard.events.addEditEvent.validations.ticket.emptyPaidTicket')),
                                );
                            },
                          }),
                        ]}>
                        {(fields, { add, remove }) => (
                          <TicketPrice
                            add={add}
                            remove={remove}
                            fields={fields}
                            firstFieldName={'price'}
                            secondFieldName={('name', 'fr')}
                          />
                        )}
                      </Form.List>
                      <Form.List
                        name="prices"
                        initialValue={eventData?.offerConfiguration?.prices}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator() {
                              if (
                                (getFieldValue('prices') != undefined &&
                                  getFieldValue('prices')?.length > 0 &&
                                  getFieldValue('prices')[0] != undefined &&
                                  getFieldValue('prices')[0].price != '') ||
                                getFieldValue('ticketLink')
                              ) {
                                return Promise.resolve();
                              } else
                                return Promise.reject(
                                  new Error(t('dashboard.events.addEditEvent.validations.ticket.emptyPaidTicket')),
                                );
                            },
                          }),
                        ]}>
                        {(fields, { add, remove }) => (
                          <TicketPrice
                            add={add}
                            remove={remove}
                            fields={fields}
                            firstFieldName={'price'}
                            secondFieldName={('name', 'en')}
                          />
                        )}
                      </Form.List>
                    </BilingualInput>
                  </>
                )}
                <br />
                {(ticketType == offerTypes.FREE || ticketType == offerTypes.PAYING) && (
                  <Form.Item label={t('dashboard.events.addEditEvent.tickets.note')}>
                    <BilingualInput fieldData={eventData?.offerConfiguration?.name}>
                      <Form.Item name="frenchTicketNote" initialValue={eventData?.offerConfiguration?.name?.fr}>
                        <TextArea
                          autoComplete="off"
                          placeholder={t('dashboard.events.addEditEvent.tickets.placeHolderNotes')}
                          style={{
                            borderRadius: '4px',
                            border: '4px solid #E8E8E8',
                            width: '423px',
                            resize: 'vertical',
                          }}
                          size="large"
                        />
                      </Form.Item>
                      <Form.Item name="englishTicketNote" initialValue={eventData?.offerConfiguration?.name?.en}>
                        <TextArea
                          autoComplete="off"
                          placeholder={t('dashboard.events.addEditEvent.tickets.placeHolderNotes')}
                          style={{
                            borderRadius: '4px',
                            border: '4px solid #E8E8E8',
                            width: '423px',
                            resize: 'vertical',
                          }}
                          size="large"
                        />
                      </Form.Item>
                    </BilingualInput>
                  </Form.Item>
                )}
              </>
              {ticketType && ticketType == offerTypes.PAYING && (
                <Form.Item
                  label={t('dashboard.events.addEditEvent.tickets.changeTicketType')}
                  style={{ lineHeight: '2.5' }}>
                  {offerTypeOptions.map((type) => {
                    if (ticketType != type.type)
                      return (
                        <ChangeType
                          key={type.type}
                          primaryIcon={<SyncOutlined />}
                          disabled={type.disabled}
                          label={type.label}
                          promptText={type.tooltip}
                          secondaryIcon={<InfoCircleOutlined />}
                          onClick={() => {
                            setTicketType(type.type);
                            form.resetFields(['prices', 'ticketLink']);
                          }}
                        />
                      );
                  })}
                </Form.Item>
              )}
            </CardEvent>
          </Row>
        </Form>
      </div>
    )
  );
}

export default AddEvent;
