import React, { useEffect, useState, useRef } from 'react';
import './addEvent.css';
import { Form, Row, Col, Input, Popover, message, Button } from 'antd';
import {
  SyncOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EditOutlined,
  SnippetsOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment-timezone';
import i18n from 'i18next';
import { useAddEventMutation, useUpdateEventMutation } from '../../../services/events';
import { useNavigate, useParams, useSearchParams, useOutletContext } from 'react-router-dom';
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
import { useGetAllTaxonomyQuery, useLazyGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { dateTimeTypeHandler } from '../../../utils/dateTimeTypeHandler';
import ImageUpload from '../../../components/ImageUpload';
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
import RecurringEvents from '../../../components/RecurringEvents';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';
import { eventFormRequiredFieldNames } from '../../../constants/eventFormRequiredFieldNames';
import StyledSwitch from '../../../components/Switch/index';
import ContentLanguageInput from '../../../components/ContentLanguageInput';
import { contentLanguage } from '../../../constants/contentLanguage';
import QuickCreateOrganization from '../../../components/Modal/QuickCreateOrganization/QuickCreateOrganization';
import { featureFlags } from '../../../utils/featureFlags';
import QuickSelect from '../../../components/Modal/QuickSelect/QuickSelect';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
const { TextArea } = Input;

function AddEvent() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [addEvent] = useAddEventMutation();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId, eventId } = useParams();
  let [searchParams] = useSearchParams();
  let duplicateId = searchParams.get('duplicateId');
  const { user } = useSelector(getUserDetails);
  const { t } = useTranslation();
  const [currentCalendarData] = useOutletContext();
  const {
    currentData: eventData,
    isError,
    isLoading,
  } = useGetEventQuery(
    { eventId: eventId ?? duplicateId, calendarId, sessionId: timestampRef },
    { skip: eventId || duplicateId ? false : true },
  );
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.EVENT,
    includeConcepts: true,
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
  const [addImage, { error: isAddImageError }] = useAddImageMutation();
  const [getAllTaxonomy] = useLazyGetAllTaxonomyQuery({ sessionId: timestampRef });

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
  const [addedFields, setAddedFields] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [scrollToSelectedField, setScrollToSelectedField] = useState();
  const [formValue, setFormValue] = useState();
  const [validateFields, setValidateFields] = useState([]);
  const [descriptionMinimumWordCount, setDescriptionMinimumWordCount] = useState(1);
  const [newEventId, setNewEventId] = useState(null);
  const [quickOrganizerModal, setQuickOrganizerModal] = useState(false);
  const [quickCreateOrganizerModal, setQuickCreateOrganizerModal] = useState(false);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');

  usePrompt(t('common.unsavedChanges'), showDialog);

  const reactQuillRefFr = useRef(null);
  const reactQuillRefEn = useRef(null);

  let initialVirtualLocation = eventData?.locations?.filter((location) => location.isVirtualLocation == true);
  let initialPlace = eventData?.locations?.filter((location) => location.isVirtualLocation == false);
  let requiredFields = currentCalendarData?.formSchema?.filter((form) => form?.formName === 'Event');
  requiredFields = requiredFields && requiredFields?.length > 0 && requiredFields[0];
  let requiredFieldNames = requiredFields ? requiredFields?.requiredFields?.map((field) => field?.fieldName) : [];
  let standardAdminOnlyFields = requiredFields?.adminOnlyFields?.standardFields ?? [];
  let dynamicAdminOnlyFields = requiredFields?.adminOnlyFields?.dynamicFields ?? [];
  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const dateTimeConverter = (date, time) => {
    let dateSelected = moment.tz(date, eventData?.scheduleTimezone ?? 'Canada/Eastern').format('DD-MM-YYYY');
    let timeSelected = moment.tz(time, eventData?.scheduleTimezone ?? 'Canada/Eastern').format('hh:mm:ss a');
    let dateTime = moment(dateSelected + ' ' + timeSelected, 'DD-MM-YYYY HH:mm a');
    return moment(dateTime).toISOString();
  };

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });
  const addUpdateEventApiHandler = (eventObj, toggle) => {
    var promise = new Promise(function (resolve, reject) {
      if ((!eventId || eventId === '') && newEventId === null) {
        addEvent({
          data: eventObj,
          calendarId,
        })
          .unwrap()
          .then((response) => {
            resolve(response?.id);
            setNewEventId(response?.id);
            if (!toggle) navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);
          })
          .catch((errorInfo) => {
            reject();
            console.log(errorInfo);
          });
      } else {
        eventObj = {
          ...eventObj,
          sameAs: eventData?.sameAs,
        };
        updateEvent({
          data: eventObj,
          calendarId,
          eventId: eventId ?? newEventId,
        })
          .unwrap()
          .then(() => {
            resolve(eventId ?? newEventId);
            if (!toggle) navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);
          })
          .catch((error) => {
            reject();
            console.log(error);
          });
      }
    });
    return promise;
  };
  const saveAsDraftHandler = (event, toggle = false) => {
    event?.preventDefault();
    setShowDialog(false);
    var promise = new Promise(function (resolve, reject) {
      form
        .validateFields([
          ...new Set([
            'french',
            'english',
            'datePicker',
            'dateRangePicker',
            'datePickerWrapper',
            'startDateRecur',
            ...(eventData?.publishState === eventPublishState.PUBLISHED ? validateFields : []),
          ]),
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
            keywords = [],
            locationId,
            offerConfiguration,
            organizers = [],
            performers = [],
            collaborators = [],
            dynamicFields = [],
            recurringEvent,
            inLanguage = [],
            image;
          let eventObj;
          if (dateType === dateTypes.SINGLE) {
            if (values?.startTime) startDateTime = dateTimeConverter(values?.datePicker, values?.startTime);
            else
              startDateTime = moment
                .tz(values?.datePicker, eventData?.scheduleTimezone ?? 'Canada/Eastern')
                .format('YYYY-MM-DD');
            if (values?.endTime) endDateTime = dateTimeConverter(values?.datePicker, values?.endTime);
          }
          if (dateType === dateTypes.RANGE) {
            if (values?.startTime) startDateTime = dateTimeConverter(values?.dateRangePicker[0], values?.startTime);
            else
              startDateTime = moment
                .tz(values?.dateRangePicker[0], eventData?.scheduleTimezone ?? 'Canada/Eastern')
                .format('YYYY-MM-DD');
            if (values?.endTime) endDateTime = dateTimeConverter(values?.dateRangePicker[1], values?.endTime);
            else
              endDateTime = moment
                .tz(values?.dateRangePicker[1], eventData?.scheduleTimezone ?? 'Canada/Eastern')
                .format('YYYY-MM-DD');
          }
          if (dateType === dateTypes.MULTIPLE) {
            const recurEvent = {
              frequency: values.frequency,
              startDate:
                form.getFieldsValue().frequency !== 'CUSTOM'
                  ? moment(values.startDateRecur[0]).format('YYYY-MM-DD')
                  : undefined,
              endDate:
                form.getFieldsValue().frequency !== 'CUSTOM'
                  ? moment(values.startDateRecur[1]).format('YYYY-MM-DD')
                  : undefined,
              startTime:
                form.getFieldsValue().frequency !== 'CUSTOM'
                  ? values.startTimeRecur
                    ? moment(values.startTimeRecur).format('HH:mm')
                    : undefined
                  : undefined,
              endTime:
                form.getFieldsValue().frequency !== 'CUSTOM' && values.endTimeRecur
                  ? moment(values.endTimeRecur).format('HH:mm')
                  : undefined,
              weekDays: values.frequency === 'WEEKLY' ? values.daysOfWeek : undefined,
              customDates: form.getFieldsValue().frequency === 'CUSTOM' ? form.getFieldsValue().customDates : undefined,
            };
            recurringEvent = recurEvent;
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
          if (values?.inLanguage) {
            inLanguage = values?.inLanguage?.map((inLanguageId) => {
              return {
                entityId: inLanguageId,
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
          if (values?.keywords?.length > 0) {
            keywords = values?.keywords;
          }
          if (ticketType) {
            offerConfiguration = {
              category: ticketType,
              ...((values?.englishTicketNote || values?.frenchTicketNote) && {
                name: {
                  en: values?.englishTicketNote,
                  fr: values?.frenchTicketNote,
                },
              }),
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
              ...(ticketType === offerTypes.REGISTER &&
                values?.registerLink && {
                  url: {
                    uri: urlProtocolCheck(values?.registerLink),
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
            ...(dateTypes.MULTIPLE && { recurringEvent }),
            inLanguage,
            isFeatured: values?.isFeatured,
          };

          if (values?.dragger?.length > 0 && values?.dragger[0]?.originFileObj) {
            const formdata = new FormData();
            formdata.append('file', values?.dragger[0].originFileObj);
            formdata &&
              addImage({ data: formdata, calendarId })
                .unwrap()
                .then((response) => {
                  image = response?.data;
                  eventObj['image'] = image;
                  addUpdateEventApiHandler(eventObj, toggle)
                    .then((id) => resolve(id))
                    .catch((error) => {
                      reject();
                      console.log(error);
                    });
                })
                .catch((error) => {
                  console.log(error);
                  const element = document.getElementsByClassName('draggerWrap');
                  element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                });
          } else {
            if (values?.draggerWrap) {
              if (values?.dragger && values?.dragger?.length == 0) eventObj['image'] = null;
              else
                eventObj['image'] = {
                  height: eventData?.image?.height,
                  type: eventData?.image?.type,
                  width: eventData?.image?.width,
                  large: {
                    entityId: eventData?.image?.large?.entityId,
                  },
                  original: {
                    entityId: eventData?.image?.original?.entityId,
                  },
                  thumbnail: {
                    entityId: eventData?.image?.thumbnail?.entityId,
                  },
                };
            }

            addUpdateEventApiHandler(eventObj, toggle)
              .then((id) => resolve(id))
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
      .validateFields(validateFields)
      .then(() => {
        saveAsDraftHandler(event, true)
          .then((id) => {
            updateEventState({ id: eventId ?? id, calendarId })
              .unwrap()
              .then(() => navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`))
              .catch((error) => console.log(error));
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => {
        console.log(error);

        message.warning({
          duration: 10,
          maxCount: 1,
          key: 'event-review-publish-warning',
          content: (
            <>
              {calendar[0]?.role === userRoles.GUEST
                ? t('dashboard.events.addEditEvent.validations.errorReview')
                : eventId && eventData?.publishState === eventPublishState.PUBLISHED
                ? t('dashboard.events.addEditEvent.validations.errorDraft')
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

  const roleCheckHandler = () => {
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
            <PublishState eventId={eventId} reviewPublishHandler={(e) => reviewPublishHandler(e)}>
              <span>{t('dashboard.events.publishState.published')}</span>
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

  const placesSearch = (inputValue = '') => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.place);
    getEntities({ searchKey: inputValue, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        setAllPlacesList(placesOptions(response, user, calendarContentLanguage));
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
          setOrganizersList(treeEntitiesOption(response, user, calendarContentLanguage));
        } else if (type == 'performers') {
          setPerformerList(treeEntitiesOption(response, user, calendarContentLanguage));
        } else if (type == 'supporters') {
          setSupporterList(treeEntitiesOption(response, user, calendarContentLanguage));
        }
      })
      .catch((error) => console.log(error));
  };

  const addFieldsHandler = (fieldNames) => {
    let array = addedFields?.concat(fieldNames);
    array = [...new Set(array)];
    setAddedFields(array);
    setScrollToSelectedField(array?.at(-1));
  };

  const onValuesChangHandler = () => {
    setShowDialog(true);
  };

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };
  const FeaturedJSX = (
    <Row justify={'end'} align={'top'} gutter={[8, 0]}>
      <Col>
        <Form.Item valuePropName="checked" name="isFeatured" initialValue={eventData?.isFeatured}>
          <StyledSwitch defaultChecked={eventData?.isFeatured} />
        </Form.Item>
      </Col>
      <Col>
        <span style={{ color: '#222732', minHeight: '32px', display: 'flex', alignItems: 'center' }}>
          {t('dashboard.events.addEditEvent.featuredEvent')}
        </span>
      </Col>
    </Row>
  );

  const copyOrganizerContactHandler = () => {
    if (selectedOrganizers?.length > 0) {
      if (selectedOrganizers[0]?.contact) {
        const { contact } = selectedOrganizers[0];
        const { email, name, telephone, url } = contact;
        form.setFieldsValue({
          frenchContactTitle: name?.fr,
          englishContactTitle: name?.en,
          contactWebsiteUrl: url?.uri,
          contactPhoneNumber: telephone,
          contactEmail: email,
        });
      }
    }
  };
  useEffect(() => {
    if (isError) navigate(`${PathName.NotFound}`);
  }, [isError]);

  useEffect(() => {
    if (addedFields?.length > 0) {
      const element = document.getElementsByClassName(scrollToSelectedField);
      element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [addedFields]);

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
    if (calendarId && eventData && currentCalendarData) {
      let initialAddedFields = [],
        isRecurring = false;
      if (routinghandler(user, calendarId, eventData?.creator?.userId, eventData?.publishState) || duplicateId) {
        if (eventData?.recurringEvent && Object.keys(eventData?.recurringEvent)?.length > 0) isRecurring = true;
        setDateType(
          dateTimeTypeHandler(
            eventData?.startDate,
            eventData?.startDateTime,
            eventData?.endDate,
            eventData?.endDateTime,
            isRecurring,
          ),
        );
        setTicketType(eventData?.offerConfiguration?.category);
        if (initialPlace && initialPlace?.length > 0) {
          initialPlace[0] = {
            ...initialPlace[0],
            ['openingHours']: initialPlace[0]?.openingHours?.uri,
          };
          let initialPlaceAccessibiltiy = [];
          if (initialPlace[0]?.accessibility?.length > 0) {
            getAllTaxonomy({
              calendarId,
              search: '',
              taxonomyClass: taxonomyClass.PLACE,
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
          setSelectedOrganizers(treeEntitiesOption(initialOrganizers, user, calendarContentLanguage));
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
          setSelectedPerformers(treeEntitiesOption(initialPerformers, user, calendarContentLanguage));
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
          setSelectedSupporters(treeEntitiesOption(initialSupporters, user, calendarContentLanguage));
          initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.supporterWrap);
        }
        if (eventData?.url?.uri) initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.eventLink);
        if (eventData?.videoUrl) initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.videoLink);
        if (eventData?.facebookUrl)
          initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.facebookLinkWrap);
        if (eventData?.keywords?.length > 0)
          initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.keywords);
        if (eventData?.accessibilityNote?.en || eventData?.accessibilityNote?.fr)
          initialAddedFields = initialAddedFields?.concat(eventAccessibilityFieldNames?.noteWrap);
        if (eventData?.inLanguage?.length > 0)
          initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.inLanguage);
        setAddedFields(initialAddedFields);
        if (eventData?.recurringEvent) {
          form.setFieldsValue({
            frequency: eventData?.recurringEvent?.frequency,
            startDateRecur: [
              moment(
                moment(
                  eventData?.recurringEvent?.startDate
                    ? eventData?.recurringEvent?.startDate
                    : eventData?.startDate ?? eventData?.startDateTime,
                  'YYYY-MM-DD',
                ).format('DD-MM-YYYY'),
                'DD-MM-YYYY',
              ),
              moment(
                moment(
                  eventData?.recurringEvent?.endDate
                    ? eventData?.recurringEvent?.endDate
                    : eventData?.endDate ?? eventData?.endDateTime,
                  'YYYY-MM-DD',
                ).format('DD-MM-YYYY'),
                'DD-MM-YYYY',
              ),
            ],
            startTimeRecur: eventData?.recurringEvent?.startTime
              ? moment(eventData?.recurringEvent?.startTime, 'HH:mm')
              : undefined,
            endTimeRecur: eventData?.recurringEvent?.endTime
              ? moment(eventData?.recurringEvent?.endTime, 'HH:mm')
              : undefined,
            customDates: eventData?.recurringEvent?.customDates,
            daysOfWeek: eventData?.recurringEvent?.weekDays,
          });
          const obj = {
            startDateRecur: [
              moment(
                moment(
                  eventData?.recurringEvent?.startDate
                    ? eventData?.recurringEvent?.startDate
                    : eventData?.startDate ?? eventData?.startDateTime,
                  'YYYY-MM-DD',
                ).format('DD-MM-YYYY'),
                'DD-MM-YYYY',
              ),
              moment(
                moment(
                  eventData?.recurringEvent?.endDate
                    ? eventData?.recurringEvent?.endDate
                    : eventData?.endDate ?? eventData?.endDateTime,
                  'YYYY-MM-DD',
                ).format('DD-MM-YYYY'),
                'DD-MM-YYYY',
              ),
            ],
            startTimeRecur: eventData?.recurringEvent?.startTime
              ? moment(eventData?.recurringEvent?.startTime, 'HH:mm')
              : undefined,
            frequency: eventData?.recurringEvent?.frequency,
            daysOfWeek: eventData?.recurringEvent?.weekDays,
          };
          setFormValue(obj);
        }
      } else
        window.location.replace(`${location?.origin}${PathName.Dashboard}/${calendarId}${PathName.Events}/${eventId}`);
    }
  }, [isLoading, currentCalendarData]);
  useEffect(() => {
    if (currentCalendarData) {
      let publishValidateFields = [];
      requiredFields?.requiredFields?.map((requiredField) => {
        switch (requiredField?.fieldName) {
          case eventFormRequiredFieldNames.NAME:
            publishValidateFields.push('french', 'english');
            break;
          case eventFormRequiredFieldNames.NAME_EN:
            publishValidateFields.push('english');
            break;
          case eventFormRequiredFieldNames.NAME_FR:
            publishValidateFields.push('french');
            break;
          case eventFormRequiredFieldNames.DESCRIPTION:
            publishValidateFields.push('englishEditor', 'frenchEditor');
            setDescriptionMinimumWordCount(Number(requiredField?.rule?.minimumWordCount));
            break;
          case eventFormRequiredFieldNames.DESCRIPTION_EN:
            publishValidateFields.push('englishEditor');
            setDescriptionMinimumWordCount(Number(requiredField?.rule?.minimumWordCount));
            break;
          case eventFormRequiredFieldNames.DESCRIPTION_FR:
            publishValidateFields.push('frenchEditor');
            setDescriptionMinimumWordCount(Number(requiredField?.rule?.minimumWordCount));
            break;
          case eventFormRequiredFieldNames.START_DATE:
            publishValidateFields.push('datePickerWrapper', 'datePicker', 'dateRangePicker', 'startDateRecur');
            break;
          case eventFormRequiredFieldNames.TICKET_INFO:
            publishValidateFields.push(
              'ticketPickerWrapper',
              'prices',
              'ticketLink',
              'registerLink',
              'englishTicketNote',
              'frenchTicketNote',
            );
            break;
          case eventFormRequiredFieldNames.EVENT_TYPE:
            publishValidateFields.push('eventType');
            break;
          case eventFormRequiredFieldNames.AUDIENCE:
            publishValidateFields.push('targetAudience');
            break;
          case eventFormRequiredFieldNames.LOCATION:
            publishValidateFields.push('location-form-wrapper');
            break;
          case eventFormRequiredFieldNames.IMAGE:
            publishValidateFields.push('draggerWrap');
            break;
          default:
            break;
        }
      });
      publishValidateFields = [...new Set(publishValidateFields)];
      setValidateFields(publishValidateFields);
    }
  }, [currentCalendarData]);

  useEffect(() => {
    if (initialEntities && currentCalendarData) {
      setOrganizersList(treeEntitiesOption(initialEntities, user, calendarContentLanguage));
      setPerformerList(treeEntitiesOption(initialEntities, user, calendarContentLanguage));
      setSupporterList(treeEntitiesOption(initialEntities, user, calendarContentLanguage));
      placesSearch();
    }
  }, [initialEntityLoading, currentCalendarData]);

  return (
    !isLoading &&
    !taxonomyLoading &&
    !initialEntityLoading &&
    currentCalendarData && (
      <div>
        <Form
          form={form}
          layout="vertical"
          name="event"
          onValuesChange={onValuesChangHandler}
          onFieldsChange={() => {
            setFormValue(form.getFieldsValue(true));
          }}>
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
                  {standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.FEATURED)
                    ? adminCheckHandler()
                      ? FeaturedJSX
                      : null
                    : FeaturedJSX}
                </Col>
              </Row>
            </Col>

            <CardEvent>
              <Form.Item
                label={t('dashboard.events.addEditEvent.language.title')}
                hidden={
                  standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.NAME) ||
                  standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.NAME_EN) ||
                  standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.NAME_FR)
                    ? adminCheckHandler()
                      ? false
                      : true
                    : false
                }
                required={
                  requiredFieldNames?.includes(eventFormRequiredFieldNames?.NAME) ||
                  requiredFieldNames?.includes(eventFormRequiredFieldNames?.NAME_EN) ||
                  requiredFieldNames?.includes(eventFormRequiredFieldNames?.NAME_FR)
                }>
                <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                  <BilingualInput fieldData={eventData?.name}>
                    <Form.Item
                      name="french"
                      key={contentLanguage.FRENCH}
                      initialValue={
                        duplicateId ? eventData?.name?.fr && 'Copie de ' + eventData?.name?.fr : eventData?.name?.fr
                      }
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
                      key={contentLanguage.ENGLISH}
                      initialValue={
                        duplicateId ? eventData?.name?.en && 'Copy of ' + eventData?.name?.en : eventData?.name?.en
                      }
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
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.language.placeHolderEnglish')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                  </BilingualInput>
                </ContentLanguageInput>

                <Form.Item
                  name="eventType"
                  label={taxonomyDetails(allTaxonomyData?.data, user, 'EventType', 'name', false)}
                  initialValue={eventData?.additionalType?.map((type) => {
                    return type?.entityId;
                  })}
                  hidden={
                    standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.EVENT_TYPE)
                      ? adminCheckHandler()
                        ? false
                        : true
                      : false
                  }
                  rules={[
                    {
                      required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.EVENT_TYPE),
                      message: t('dashboard.events.addEditEvent.validations.eventType'),
                    },
                  ]}>
                  <TreeSelectOption
                    placeholder={t('dashboard.events.addEditEvent.language.placeHolderEventType')}
                    allowClear
                    treeDefaultExpandAll
                    notFoundContent={<NoContent />}
                    clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                    treeData={treeTaxonomyOptions(allTaxonomyData, user, 'EventType', false, calendarContentLanguage)}
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
                  label={taxonomyDetails(allTaxonomyData?.data, user, 'Audience', 'name', false)}
                  initialValue={eventData?.audience?.map((audience) => {
                    return audience?.entityId;
                  })}
                  hidden={
                    standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.AUDIENCE)
                      ? adminCheckHandler()
                        ? false
                        : true
                      : false
                  }
                  rules={[
                    {
                      required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.AUDIENCE),
                      message: t('dashboard.events.addEditEvent.validations.targetAudience'),
                    },
                  ]}>
                  <TreeSelectOption
                    allowClear
                    treeDefaultExpandAll
                    notFoundContent={<NoContent />}
                    clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                    treeData={treeTaxonomyOptions(allTaxonomyData, user, 'Audience', false, calendarContentLanguage)}
                    placeholder={t('dashboard.events.addEditEvent.language.placeHolderTargetAudience')}
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
                        initialValue={initialValues}
                        hidden={
                          dynamicAdminOnlyFields?.includes(taxonomy?.id) ? (adminCheckHandler() ? false : true) : false
                        }>
                        <TreeSelectOption
                          allowClear
                          treeDefaultExpandAll
                          notFoundContent={<NoContent />}
                          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                          treeData={treeDynamicTaxonomyOptions(taxonomy?.concept, user, calendarContentLanguage)}
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
                          <>
                            <Form.Item
                              name="datePicker"
                              label={t('dashboard.events.addEditEvent.dates.date')}
                              initialValue={
                                dateTimeTypeHandler(
                                  eventData?.startDate,
                                  eventData?.startDateTime,
                                  eventData?.endDate,
                                  eventData?.endDateTime,
                                ) === dateTypes.SINGLE
                                  ? moment.tz(
                                      eventData?.startDate ?? eventData?.startDateTime,
                                      eventData?.scheduleTimezone ?? 'Canada/Eastern',
                                    )
                                  : undefined
                              }
                              hidden={
                                standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.START_DATE)
                                  ? adminCheckHandler()
                                    ? false
                                    : true
                                  : false
                              }
                              rules={[
                                {
                                  required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.START_DATE),
                                  message: t('dashboard.events.addEditEvent.validations.date'),
                                },
                              ]}>
                              <DatePickerStyled style={{ width: '423px' }} />
                            </Form.Item>
                            <Row justify="space-between">
                              <Col flex={'203.5px'}>
                                <Form.Item
                                  name="startTime"
                                  label={t('dashboard.events.addEditEvent.dates.startTime')}
                                  initialValue={
                                    eventData?.startDateTime
                                      ? moment.tz(
                                          eventData?.startDateTime,
                                          eventData?.scheduleTimezone ?? 'Canada/Eastern',
                                        )
                                      : undefined
                                  }>
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
                                  initialValue={
                                    eventData?.endDateTime
                                      ? moment.tz(
                                          eventData?.endDateTime,
                                          eventData?.scheduleTimezone ?? 'Canada/Eastern',
                                        )
                                      : undefined
                                  }>
                                  <TimePickerStyled
                                    placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                                    use12Hours={i18n?.language === 'en' ? true : false}
                                    format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </>
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
                              ) === dateTypes.RANGE
                                ? [
                                    moment.tz(
                                      eventData?.startDate ?? eventData?.startDateTime,
                                      eventData?.scheduleTimezone ?? 'Canada/Eastern',
                                    ),
                                    moment.tz(
                                      eventData?.endDate ?? eventData?.endDateTime,
                                      eventData?.scheduleTimezone ?? 'Canada/Eastern',
                                    ),
                                  ]
                                : undefined
                            }
                            hidden={
                              standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.START_DATE)
                                ? adminCheckHandler()
                                  ? false
                                  : true
                                : false
                            }
                            rules={[
                              {
                                required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.START_DATE),
                                message: t('dashboard.events.addEditEvent.validations.date'),
                              },
                            ]}>
                            <DateRangePicker style={{ width: '423px' }} />
                          </Form.Item>
                        )}
                        {dateType === dateTypes.MULTIPLE && (
                          <>
                            <RecurringEvents
                              currentLang={i18n.language}
                              formFields={formValue}
                              numberOfDaysEvent={eventData?.subEvents?.length}
                              form={form}
                              eventDetails={eventData}
                              setFormFields={setFormValue}
                              dateType={dateType}
                            />
                          </>
                        )}
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
                              if (
                                getFieldValue('datePicker') ||
                                getFieldValue('dateRangePicker') ||
                                getFieldValue('startDateRecur')
                              ) {
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
                            form.setFieldsValue({
                              datePicker: undefined,
                              dateRangePicker: undefined,
                              startDateRecur: undefined,
                            });
                            form.resetFields(['frequency']);
                            setFormValue(null);
                          }}
                        />
                      );
                  })}
                </Form.Item>
              )}
            </CardEvent>
            <CardEvent
              title={t('dashboard.events.addEditEvent.location.title')}
              required={requiredFieldNames?.includes(eventFormRequiredFieldNames?.LOCATION)}>
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
                  label={t('dashboard.events.addEditEvent.location.title')}
                  hidden={
                    standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.LOCATION)
                      ? adminCheckHandler()
                        ? false
                        : true
                      : false
                  }>
                  <Popover
                    open={isPopoverOpen.locationPlace}
                    onOpenChange={(open) => setIsPopoverOpen({ ...isPopoverOpen, locationPlace: open })}
                    overlayClassName="event-popover"
                    placement="bottom"
                    autoAdjustOverflow={false}
                    getPopupContainer={(trigger) => trigger.parentNode}
                    trigger={['click']}
                    content={
                      <div>
                        <div className="search-scrollable-content">
                          {allPlacesList?.length > 0 ? (
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
                          )}
                        </div>
                      </div>
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
                      postalAddress={locationPlace?.postalAddress}
                      accessibility={locationPlace?.accessibility}
                      openingHours={locationPlace?.openingHours}
                      calendarContentLanguage={calendarContentLanguage}
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
                  style={{
                    display: !addedFields?.includes(virtualLocationFieldNames.virtualLocationName) && 'none',
                  }}>
                  <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                    <BilingualInput fieldData={initialVirtualLocation && initialVirtualLocation[0]?.name}>
                      <Form.Item
                        name="frenchVirtualLocation"
                        key={contentLanguage.FRENCH}
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
                        key={contentLanguage.ENGLISH}
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
                  </ContentLanguageInput>
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
                  required={
                    requiredFieldNames?.includes(eventFormRequiredFieldNames?.DESCRIPTION) ||
                    requiredFieldNames?.includes(eventFormRequiredFieldNames?.DESCRIPTION_EN) ||
                    requiredFieldNames?.includes(eventFormRequiredFieldNames?.DESCRIPTION_FR)
                  }
                  hidden={
                    standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.DESCRIPTION) ||
                    standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.DESCRIPTION_EN) ||
                    standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.DESCRIPTION_FR)
                      ? adminCheckHandler()
                        ? false
                        : true
                      : false
                  }>
                  <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                    <BilingualInput fieldData={eventData?.description}>
                      <TextEditor
                        formName="frenchEditor"
                        key={contentLanguage.FRENCH}
                        calendarContentLanguage={calendarContentLanguage}
                        initialValue={eventData?.description?.fr}
                        dependencies={['englishEditor']}
                        currentReactQuillRef={reactQuillRefFr}
                        editorLanguage={'fr'}
                        placeholder={t('dashboard.events.addEditEvent.otherInformation.description.frenchPlaceholder')}
                        descriptionMinimumWordCount={descriptionMinimumWordCount}
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
                                    calendarContentLanguage === contentLanguage.ENGLISH ||
                                    calendarContentLanguage === contentLanguage.FRENCH
                                      ? t(
                                          'dashboard.events.addEditEvent.validations.otherInformation.unilingualEmptyDescription',
                                        )
                                      : calendarContentLanguage === contentLanguage.BILINGUAL &&
                                        t(
                                          'dashboard.events.addEditEvent.validations.otherInformation.emptyDescription',
                                          {
                                            wordCount: descriptionMinimumWordCount,
                                          },
                                        ),
                                  ),
                                );
                            },
                          }),
                          () => ({
                            validator() {
                              if (
                                reactQuillRefFr?.current?.unprivilegedEditor
                                  ?.getText()
                                  .split(' ')
                                  ?.filter((n) => n != '')?.length > descriptionMinimumWordCount
                              ) {
                                return Promise.resolve();
                              } else if (
                                reactQuillRefEn?.current?.unprivilegedEditor
                                  ?.getText()
                                  .split(' ')
                                  ?.filter((n) => n != '')?.length > descriptionMinimumWordCount
                              )
                                return Promise.resolve();
                              else
                                return Promise.reject(
                                  new Error(
                                    calendarContentLanguage === contentLanguage.ENGLISH ||
                                    calendarContentLanguage === contentLanguage.FRENCH
                                      ? t(
                                          'dashboard.events.addEditEvent.validations.otherInformation.unilingualDescriptionShort',
                                        )
                                      : calendarContentLanguage === contentLanguage.BILINGUAL &&
                                        t('dashboard.events.addEditEvent.validations.otherInformation.frenchShort'),
                                  ),
                                );
                            },
                          }),
                        ]}
                      />

                      <TextEditor
                        formName="englishEditor"
                        key={contentLanguage.ENGLISH}
                        initialValue={eventData?.description?.en}
                        calendarContentLanguage={calendarContentLanguage}
                        dependencies={['frenchEditor']}
                        currentReactQuillRef={reactQuillRefEn}
                        editorLanguage={'en'}
                        placeholder={t('dashboard.events.addEditEvent.otherInformation.description.englishPlaceholder')}
                        descriptionMinimumWordCount={descriptionMinimumWordCount}
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
                                    calendarContentLanguage === contentLanguage.ENGLISH ||
                                    calendarContentLanguage === contentLanguage.FRENCH
                                      ? t(
                                          'dashboard.events.addEditEvent.validations.otherInformation.unilingualEmptyDescription',
                                        )
                                      : calendarContentLanguage === contentLanguage.BILINGUAL &&
                                        t(
                                          'dashboard.events.addEditEvent.validations.otherInformation.emptyDescription',
                                          {
                                            wordCount: descriptionMinimumWordCount,
                                          },
                                        ),
                                  ),
                                );
                            },
                          }),
                          () => ({
                            validator() {
                              if (
                                reactQuillRefEn?.current?.unprivilegedEditor
                                  ?.getText()
                                  .split(' ')
                                  ?.filter((n) => n != '')?.length > descriptionMinimumWordCount
                              ) {
                                return Promise.resolve();
                              } else if (
                                reactQuillRefFr?.current?.unprivilegedEditor
                                  ?.getText()
                                  .split(' ')
                                  ?.filter((n) => n != '')?.length > descriptionMinimumWordCount
                              )
                                return Promise.resolve();
                              else
                                return Promise.reject(
                                  new Error(
                                    calendarContentLanguage === contentLanguage.ENGLISH ||
                                    calendarContentLanguage === contentLanguage.FRENCH
                                      ? t(
                                          'dashboard.events.addEditEvent.validations.otherInformation.unilingualDescriptionShort',
                                        )
                                      : calendarContentLanguage === contentLanguage.BILINGUAL &&
                                        t('dashboard.events.addEditEvent.validations.otherInformation.englishShort'),
                                  ),
                                );
                            },
                          }),
                        ]}
                      />
                    </BilingualInput>
                  </ContentLanguageInput>
                </Form.Item>
                <Form.Item
                  label={t('dashboard.events.addEditEvent.otherInformation.image.title')}
                  name="draggerWrap"
                  className="draggerWrap"
                  required={requiredFieldNames?.includes(eventFormRequiredFieldNames?.IMAGE)}
                  hidden={
                    standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.IMAGE)
                      ? adminCheckHandler()
                        ? false
                        : true
                      : false
                  }
                  initialValue={eventData?.image && eventData?.image?.original?.uri}
                  {...(isAddImageError && {
                    help: t('dashboard.events.addEditEvent.validations.errorImage'),
                    validateStatus: 'error',
                  })}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator() {
                        if (
                          (getFieldValue('dragger') != undefined && getFieldValue('dragger')?.length > 0) ||
                          (eventData?.image?.original?.uri && !getFieldValue('dragger')) ||
                          (eventData?.image?.original?.uri && getFieldValue('dragger')?.length > 0)
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
                  <ImageUpload imageUrl={eventData?.image?.original?.uri} imageReadOnly={false} preview={true} />
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
                        <div>
                          <div className="search-scrollable-content">
                            {organizersList?.length > 0 ? (
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
                            )}
                          </div>
                          <FeatureFlag isFeatureEnabled={featureFlags.quickCreateOrganization}>
                            {quickCreateKeyword?.length > 0 && (
                              <div
                                className="quick-create"
                                onClick={() => {
                                  setIsPopoverOpen({ ...isPopoverOpen, organizer: false });
                                  setQuickOrganizerModal(true);
                                }}>
                                <PlusCircleOutlined />
                                &nbsp;{t('dashboard.events.addEditEvent.quickCreate.create')}&nbsp;&#34;
                                {quickCreateKeyword}&#34;
                              </div>
                            )}
                          </FeatureFlag>
                        </div>
                      }>
                      <EventsSearch
                        style={{ borderRadius: '4px' }}
                        placeholder={t('dashboard.events.addEditEvent.otherInformation.organizer.searchPlaceholder')}
                        onChange={(e) => {
                          setQuickCreateKeyword(e.target.value);
                          organizationPersonSearch(e.target.value, 'organizers');
                          setIsPopoverOpen({ ...isPopoverOpen, organizer: true });
                        }}
                        onClick={(e) => {
                          setQuickCreateKeyword(e.target.value);
                          setIsPopoverOpen({ ...isPopoverOpen, organizer: true });
                        }}
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
                  <QuickSelect
                    open={quickOrganizerModal}
                    setOpen={setQuickOrganizerModal}
                    setQuickCreateOrganizerModal={setQuickCreateOrganizerModal}
                  />
                  <QuickCreateOrganization
                    open={quickCreateOrganizerModal}
                    setOpen={setQuickCreateOrganizerModal}
                    calendarId={calendarId}
                    keyword={quickCreateKeyword}
                    setKeyword={setQuickCreateKeyword}
                    interfaceLanguage={user?.interfaceLanguage?.toLowerCase()}
                    calendarContentLanguage={calendarContentLanguage}
                    setSelectedOrganizers={setSelectedOrganizers}
                    selectedOrganizers={selectedOrganizers}
                  />
                </Form.Item>
                <Form.Item
                  label={t('dashboard.events.addEditEvent.otherInformation.contact.title')}
                  className={otherInformationFieldNames.contact}
                  name={otherInformationFieldNames.contact}
                  style={{
                    display: !addedFields?.includes(otherInformationFieldNames.contact) && 'none',
                  }}>
                  {selectedOrganizers?.length > 0 && selectedOrganizers[0]?.contact && (
                    <Outlined
                      icon={<SnippetsOutlined style={{ color: '#1B3DE6', fontSize: '20px' }} />}
                      size="large"
                      label={t('dashboard.events.addEditEvent.otherInformation.contact.copyOrganizerContact')}
                      onClick={copyOrganizerContactHandler}
                    />
                  )}

                  <Form.Item
                    label={t('dashboard.events.addEditEvent.otherInformation.contact.contactTitle')}
                    className="subheading-wrap">
                    <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                      <BilingualInput fieldData={eventData?.contactPoint?.name}>
                        <Form.Item
                          name="frenchContactTitle"
                          initialValue={eventData?.contactPoint?.name?.fr}
                          key={contentLanguage.FRENCH}>
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
                        <Form.Item
                          name="englishContactTitle"
                          initialValue={eventData?.contactPoint?.name?.en}
                          key={contentLanguage.ENGLISH}>
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
                    </ContentLanguageInput>
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
                        <div>
                          <div className="search-scrollable-content">
                            {performerList?.length > 0 ? (
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
                            )}
                          </div>
                          <FeatureFlag isFeatureEnabled={featureFlags.quickCreateOrganization}>
                            {quickCreateKeyword?.length > 0 && (
                              <div
                                className="quick-create"
                                onClick={() => {
                                  setIsPopoverOpen({ ...isPopoverOpen, performer: false });
                                  setQuickOrganizerModal(true);
                                }}>
                                <PlusCircleOutlined />
                                &nbsp;{t('dashboard.events.addEditEvent.quickCreate.create')}&nbsp;&#34;
                                {quickCreateKeyword}&#34;
                              </div>
                            )}
                          </FeatureFlag>
                        </div>
                      }>
                      <EventsSearch
                        style={{ borderRadius: '4px' }}
                        placeholder={t('dashboard.events.addEditEvent.otherInformation.performer.searchPlaceholder')}
                        onChange={(e) => {
                          organizationPersonSearch(e.target.value, 'performers');
                          setIsPopoverOpen({ ...isPopoverOpen, performer: true });
                          setQuickCreateKeyword(e.target.value);
                        }}
                        onClick={(e) => {
                          setQuickCreateKeyword(e.target.value);
                          setIsPopoverOpen({ ...isPopoverOpen, performer: true });
                        }}
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
                        <div>
                          <div className="search-scrollable-content">
                            {supporterList?.length > 0 ? (
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
                            )}
                          </div>
                          <FeatureFlag isFeatureEnabled={featureFlags.quickCreateOrganization}>
                            {quickCreateKeyword?.length > 0 && (
                              <div
                                className="quick-create"
                                onClick={() => {
                                  setIsPopoverOpen({ ...isPopoverOpen, supporter: false });
                                  setQuickOrganizerModal(true);
                                }}>
                                <PlusCircleOutlined />
                                &nbsp;{t('dashboard.events.addEditEvent.quickCreate.create')}&nbsp;&#34;
                                {quickCreateKeyword}&#34;
                              </div>
                            )}
                          </FeatureFlag>
                        </div>
                      }>
                      <EventsSearch
                        style={{ borderRadius: '4px' }}
                        placeholder={t('dashboard.events.addEditEvent.otherInformation.supporter.searchPlaceholder')}
                        onChange={(e) => {
                          organizationPersonSearch(e.target.value, 'supporters');
                          setIsPopoverOpen({ ...isPopoverOpen, supporter: true });
                          setQuickCreateKeyword(e.target.value);
                        }}
                        onClick={(e) => {
                          setQuickCreateKeyword(e.target.value);
                          setIsPopoverOpen({ ...isPopoverOpen, supporter: true });
                        }}
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
                <Form.Item
                  name={otherInformationFieldNames.inLanguage}
                  className={otherInformationFieldNames.inLanguage}
                  style={{
                    display: !addedFields?.includes(otherInformationFieldNames.inLanguage) && 'none',
                  }}
                  label={taxonomyDetails(allTaxonomyData?.data, user, 'inLanguage', 'name', false)}
                  initialValue={eventData?.inLanguage?.map((inLanguage) => {
                    return inLanguage?.entityId;
                  })}>
                  <TreeSelectOption
                    allowClear
                    treeDefaultExpandAll
                    placeholder={t('dashboard.events.addEditEvent.otherInformation.eventLanguagePlaceholder')}
                    notFoundContent={<NoContent />}
                    clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                    treeData={treeTaxonomyOptions(allTaxonomyData, user, 'inLanguage', false, calendarContentLanguage)}
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
              </>
              <Form.Item label={t('dashboard.events.addEditEvent.addMoreDetails')} style={{ lineHeight: '2.5' }}>
                {addedFields?.includes(otherInformationFieldNames.contact) &&
                addedFields?.includes(otherInformationFieldNames.performerWrap) &&
                addedFields?.includes(otherInformationFieldNames.supporterWrap) &&
                addedFields?.includes(otherInformationFieldNames.eventLink) &&
                addedFields?.includes(otherInformationFieldNames.videoLink) &&
                addedFields?.includes(otherInformationFieldNames.facebookLinkWrap) &&
                addedFields?.includes(otherInformationFieldNames.keywords) &&
                addedFields?.includes(otherInformationFieldNames.inLanguage) ? (
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
                <p className="add-event-date-heading">
                  {t('dashboard.events.addEditEvent.eventAccessibility.subHeading')}
                </p>
                <Form.Item
                  name="eventAccessibility"
                  className="eventAccessibility"
                  label={taxonomyDetails(allTaxonomyData?.data, user, 'EventAccessibility', 'name', false)}
                  initialValue={eventData?.accessibility?.map((type) => {
                    return type?.entityId;
                  })}
                  help={
                    <p className="add-event-date-heading" style={{ fontSize: '12px' }}>
                      {t('dashboard.events.addEditEvent.eventAccessibility.footer')}
                    </p>
                  }>
                  <TreeSelectOption
                    allowClear
                    treeDefaultExpandAll
                    style={{ width: '423px' }}
                    notFoundContent={<NoContent />}
                    clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                    treeData={treeTaxonomyOptions(
                      allTaxonomyData,
                      user,
                      'EventAccessibility',
                      false,
                      calendarContentLanguage,
                    )}
                    placeholder={t('dashboard.events.addEditEvent.eventAccessibility.placeHolderEventAccessibility')}
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
                  <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                    <BilingualInput fieldData={eventData?.accessibilityNote}>
                      <Form.Item
                        name="frenchAccessibilityNote"
                        initialValue={eventData?.accessibilityNote?.fr}
                        key={contentLanguage.FRENCH}>
                        <TextArea
                          autoComplete="off"
                          placeholder={t(
                            'dashboard.events.addEditEvent.eventAccessibility.placeHolderEventAccessibilityFrenchNote',
                          )}
                          style={{
                            borderRadius: '4px',
                            border: '4px solid #E8E8E8',
                            width: '423px',
                            resize: 'vertical',
                          }}
                          size="large"
                        />
                      </Form.Item>
                      <Form.Item
                        name="englishAccessibilityNote"
                        initialValue={eventData?.accessibilityNote?.en}
                        key={contentLanguage.ENGLISH}>
                        <TextArea
                          autoComplete="off"
                          placeholder={t(
                            'dashboard.events.addEditEvent.eventAccessibility.placeHolderEventAccessibilityEnglishNote',
                          )}
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
                  </ContentLanguageInput>
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
            <CardEvent
              title={t('dashboard.events.addEditEvent.tickets.title')}
              required={requiredFieldNames?.includes(eventFormRequiredFieldNames?.TICKET_INFO)}
              hidden={
                standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.TICKET_INFO)
                  ? adminCheckHandler()
                    ? false
                    : true
                  : false
              }>
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
                                  (getFieldValue('ticketLink') ||
                                    getFieldValue('prices') ||
                                    getFieldValue('frenchTicketNote') ||
                                    getFieldValue('englishTicketNote'))) ||
                                (ticketType == offerTypes.REGISTER &&
                                  (getFieldValue('registerLink') ||
                                    getFieldValue('frenchTicketNote') ||
                                    getFieldValue('englishTicketNote')))
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
                            style={{ backgroundColor: ticketType == offerTypes.FREE && '#EFF2FF' }}
                            iconrender={<MoneyFree />}
                            label={t('dashboard.events.addEditEvent.tickets.free')}
                            onClick={() => setTicketType(offerTypes.FREE)}
                          />
                          <DateAction
                            iconrender={<Money />}
                            label={t('dashboard.events.addEditEvent.tickets.paid')}
                            onClick={() => setTicketType(offerTypes.PAYING)}
                          />
                          <DateAction
                            iconrender={<EditOutlined />}
                            label={t('dashboard.events.addEditEvent.tickets.registration')}
                            onClick={() => setTicketType(offerTypes.REGISTER)}
                          />
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                {ticketType == offerTypes.REGISTER && (
                  <Form.Item
                    name="registerLink"
                    label={t('dashboard.events.addEditEvent.tickets.registerLink')}
                    initialValue={eventData?.offerConfiguration?.url?.uri}
                    rules={[
                      {
                        type: 'url',
                        message: t('dashboard.events.addEditEvent.validations.url'),
                      },

                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (value || getFieldValue('frenchTicketNote') || getFieldValue('englishTicketNote')) {
                            return Promise.resolve();
                          } else
                            return Promise.reject(
                              new Error(t('dashboard.events.addEditEvent.validations.ticket.emptyRegister')),
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
                              value ||
                              getFieldValue('frenchTicketNote') ||
                              getFieldValue('englishTicketNote')
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
                    <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                      <BilingualInput>
                        <Form.List
                          name="prices"
                          initialValue={eventData?.offerConfiguration?.prices}
                          key={contentLanguage.FRENCH}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator() {
                                if (
                                  (getFieldValue('prices') != undefined &&
                                    getFieldValue('prices')?.length > 0 &&
                                    getFieldValue('prices')[0] != undefined &&
                                    getFieldValue('prices')[0].price != '') ||
                                  getFieldValue('ticketLink') ||
                                  getFieldValue('frenchTicketNote') ||
                                  getFieldValue('englishTicketNote')
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
                              secondFieldName={'name'}
                              thirdFieldName={'fr'}
                            />
                          )}
                        </Form.List>
                        <Form.List
                          name="prices"
                          initialValue={eventData?.offerConfiguration?.prices}
                          key={contentLanguage.ENGLISH}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator() {
                                if (
                                  (getFieldValue('prices') != undefined &&
                                    getFieldValue('prices')?.length > 0 &&
                                    getFieldValue('prices')[0] != undefined &&
                                    getFieldValue('prices')[0].price != '') ||
                                  getFieldValue('ticketLink') ||
                                  getFieldValue('frenchTicketNote') ||
                                  getFieldValue('englishTicketNote')
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
                              secondFieldName={'name'}
                              thirdFieldName={'en'}
                            />
                          )}
                        </Form.List>
                      </BilingualInput>
                    </ContentLanguageInput>
                  </>
                )}
                <br />
                {(ticketType == offerTypes.FREE ||
                  ticketType == offerTypes.PAYING ||
                  ticketType == offerTypes.REGISTER) && (
                  <Form.Item label={t('dashboard.events.addEditEvent.tickets.note')}>
                    <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                      <BilingualInput fieldData={eventData?.offerConfiguration?.name}>
                        <Form.Item
                          name="frenchTicketNote"
                          key={contentLanguage.FRENCH}
                          initialValue={eventData?.offerConfiguration?.name?.fr}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator() {
                                if (
                                  (getFieldValue('prices') != undefined &&
                                    getFieldValue('prices')?.length > 0 &&
                                    getFieldValue('prices')[0] != undefined &&
                                    getFieldValue('prices')[0].price != '') ||
                                  getFieldValue('ticketLink') ||
                                  getFieldValue('registerLink') ||
                                  (ticketType == offerTypes.PAYING || ticketType == offerTypes.REGISTER
                                    ? getFieldValue('frenchTicketNote') || getFieldValue('englishTicketNote')
                                    : true)
                                ) {
                                  return Promise.resolve();
                                } else
                                  return Promise.reject(
                                    new Error(
                                      ticketType == offerTypes.PAYING
                                        ? t('dashboard.events.addEditEvent.validations.ticket.emptyPaidTicket')
                                        : ticketType == offerTypes.REGISTER &&
                                          t('dashboard.events.addEditEvent.validations.ticket.emptyRegister'),
                                    ),
                                  );
                              },
                            }),
                          ]}>
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
                        <Form.Item
                          name="englishTicketNote"
                          key={contentLanguage.ENGLISH}
                          initialValue={eventData?.offerConfiguration?.name?.en}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator() {
                                if (
                                  (getFieldValue('prices') != undefined &&
                                    getFieldValue('prices')?.length > 0 &&
                                    getFieldValue('prices')[0] != undefined &&
                                    getFieldValue('prices')[0].price != '') ||
                                  getFieldValue('ticketLink') ||
                                  getFieldValue('registerLink') ||
                                  (ticketType == offerTypes.PAYING || ticketType == offerTypes.REGISTER
                                    ? getFieldValue('frenchTicketNote') || getFieldValue('englishTicketNote')
                                    : true)
                                ) {
                                  return Promise.resolve();
                                } else
                                  return Promise.reject(
                                    new Error(
                                      ticketType == offerTypes.PAYING
                                        ? t('dashboard.events.addEditEvent.validations.ticket.emptyPaidTicket')
                                        : ticketType == offerTypes.REGISTER &&
                                          t('dashboard.events.addEditEvent.validations.ticket.emptyRegister'),
                                    ),
                                  );
                              },
                            }),
                          ]}>
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
                    </ContentLanguageInput>
                  </Form.Item>
                )}
              </>
              {ticketType && (ticketType == offerTypes.PAYING || ticketType == offerTypes.REGISTER) && (
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
