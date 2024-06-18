import React, { useEffect, useState, useRef, useCallback } from 'react';
import './addEvent.css';
import { Form, Row, Col, Input, message, Button, notification } from 'antd';
import { Confirm } from '../../../components/Modal/Confirm/Confirm';
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
import { useNavigate, useParams, useSearchParams, useOutletContext, useLocation } from 'react-router-dom';
import { useGetEventQuery, useUpdateEventStateMutation } from '../../../services/events';
import { PathName } from '../../../constants/pathName';
import Outlined from '../../../components/Button/Outlined';
import PrimaryButton from '../../../components/Button/Primary';
import OutlinedButton from '../../..//components/Button/Outlined';
import { Translation, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
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
import { useLazyGetEntitiesQuery } from '../../../services/entities';
import { entitiesClass } from '../../../constants/entitiesClass';
import SelectionItem from '../../../components/List/SelectionItem';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import NoContent from '../../../components/NoContent/NoContent';
import { locationType, locationTypeOptions, virtualLocationFieldNames } from '../../../constants/locationTypeOptions';
import { otherInformationFieldNames, otherInformationOptions } from '../../../constants/otherInformationOptions';
import { eventAccessibilityFieldNames, eventAccessibilityOptions } from '../../../constants/eventAccessibilityOptions';
import { Prompt } from '../../../hooks/usePrompt';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
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
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import QuickCreatePerson from '../../../components/Modal/QuickCreatePerson';
import QuickCreatePlace from '../../../components/Modal/QuickCreatePlace';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { externalSourceOptions, sourceOptions } from '../../../constants/sourceOptions';
import { useLazyGetExternalSourceQuery } from '../../../services/externalSource';
import ArtsDataInfo from '../../../components/ArtsDataInfo/ArtsDataInfo';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import KeyboardAccessibleLayout from '../../../layout/KeyboardAccessibleLayout/KeyboardAccessibleLayout';
import CustomPopover from '../../../components/Popover/Popover';
import { removeEmptyParagraphsAtEnd } from '../../../utils/removeEmptyParagraphsAtEnd';
import Alert from '../../../components/Alert';
import ChangeTypeLayout from '../../../layout/ChangeTypeLayout/ChangeTypeLayout';
import { getEmbedUrl, validateVimeoURL, validateYouTubeURL } from '../../../utils/getEmbedVideoUrl';
import { sameAsTypes } from '../../../constants/sameAsTypes';
import {
  clearActiveFallbackFieldsInfo,
  getActiveFallbackFieldsInfo,
  getLanguageLiteralBannerDisplayStatus,
  setLanguageLiteralBannerDisplayStatus,
} from '../../../redux/reducer/languageLiteralSlice';
import { removeUneditedFallbackValues } from '../../../utils/removeUneditedFallbackValues';
import { groupEventsByDate } from '../../../utils/groupSubEventsConfigByDate';
import MultipleImageUpload from '../../../components/MultipleImageUpload';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';

const { TextArea } = Input;

function AddEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  Form.useWatch('startTime', form);
  Form.useWatch('endTime', form);
  const timestampRef = useRef(Date.now()).current;
  const { calendarId, eventId } = useParams();
  let [searchParams] = useSearchParams();
  let duplicateId = searchParams.get('duplicateId');
  const { user } = useSelector(getUserDetails);
  const activeFallbackFieldsInfo = useSelector(getActiveFallbackFieldsInfo);
  const languageLiteralBannerDisplayStatus = useSelector(getLanguageLiteralBannerDisplayStatus);
  const { t } = useTranslation();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
    isReadOnly,
  ] = useOutletContext();
  const {
    currentData: eventData,
    isError,
    isLoading,
  } = useGetEventQuery(
    { eventId: eventId ?? duplicateId, calendarId, sessionId: timestampRef },
    { skip: eventId || duplicateId ? false : true },
  );
  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.EVENT);
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
  });

  const [addEvent, { isLoading: addEventLoading, isSuccess: addEventSuccess }] = useAddEventMutation();
  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery();
  const [getExternalSource, { isFetching: isExternalSourceFetching }] = useLazyGetExternalSourceQuery();
  const [updateEventState, { isLoading: updateEventStateLoading }] = useUpdateEventStateMutation();
  const [updateEvent, { isLoading: updateEventLoading, isSuccess: updateEventSuccess }] = useUpdateEventMutation();
  const [addImage, { error: isAddImageError, isLoading: addImageLoading }] = useAddImageMutation();
  const [getAllTaxonomy] = useLazyGetAllTaxonomyQuery({ sessionId: timestampRef });

  const [dateType, setDateType] = useState();
  const [ticketType, setTicketType] = useState();
  const [organizersList, setOrganizersList] = useState([]);
  const [performerList, setPerformerList] = useState([]);
  const [supporterList, setSupporterList] = useState([]);
  const [organizersArtsdataList, setOrganizersArtsdataList] = useState([]);
  const [performerArtsdataList, setPerformerArtsdataList] = useState([]);
  const [supporterArtsdataList, setSupporterArtsdataList] = useState([]);
  const [allPlacesList, setAllPlacesList] = useState([]);
  const [allPlacesArtsdataList, setAllPlacesArtsdataList] = useState([]);
  const [organizersImportsFootlightList, setOrganizersImportsFootlightList] = useState([]);
  const [performerImportsFootlightList, setPerformerImportsFootlightList] = useState([]);
  const [supporterImportsFootlightList, setSupporterImportsFootlightList] = useState([]);
  const [allPlacesImportsFootlightList, setAllPlacesImportsFootlightList] = useState([]);
  const [locationPlace, setLocationPlace] = useState();
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [selectedPerformers, setSelectedPerformers] = useState([]);
  const [selectedSupporters, setSelectedSupporters] = useState([]);
  const [loaderModalOpen, setLoaderModalOpen] = useState(false);
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
  const [quickCreatePersonModal, setQuickCreatePersonModal] = useState(false);
  const [quickCreatePlaceModal, setQuickCreatePlaceModal] = useState(false);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');
  const [selectedOrganizerPerformerSupporterType, setSelectedOrganizerPerformerSupporterType] = useState();
  const [imageCropOpen, setImageCropOpen] = useState(false);

  setContentBackgroundColor('#F9FAFF');

  const reactQuillRefFr = useRef(null);
  const reactQuillRefEn = useRef(null);
  let initialVirtualLocation = eventData?.locations?.filter((location) => location.isVirtualLocation == true);
  let initialPlace = eventData?.locations?.filter((location) => location.isVirtualLocation == false);
  let requiredFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.event);
  let requiredFieldNames = requiredFields
    ? requiredFields[0]?.formFieldProperties?.mandatoryFields?.standardFields
        ?.map((field) => field?.fieldName)
        ?.concat(requiredFields[0]?.formFieldProperties?.mandatoryFields?.dynamicFields?.map((field) => field))
    : [];
  let standardAdminOnlyFields =
    requiredFields && requiredFields?.length > 0
      ? requiredFields[0]?.formFieldProperties?.adminOnlyFields?.standardFields?.map((field) => field?.fieldName)
      : [];
  let dynamicAdminOnlyFields =
    requiredFields && requiredFields?.length > 0
      ? requiredFields[0]?.formFieldProperties?.adminOnlyFields?.dynamicFields?.map((field) => field)
      : [];
  requiredFields =
    requiredFields &&
    requiredFields?.length > 0 &&
    requiredFields[0]?.formFieldProperties?.mandatoryFields?.standardFields?.concat(
      requiredFields[0]?.formFieldProperties?.mandatoryFields?.dynamicFields?.map((field) => {
        return { fieldName: field };
      }),
    );

  let imageConfig = currentCalendarData?.imageConfig?.length > 0 && currentCalendarData?.imageConfig[0];
  let mainImageData = eventData?.image?.find((image) => image?.isMain) || null;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const dateTimeConverter = (date, time) => {
    let dateSelected = date.format('DD-MM-YYYY');
    let timeSelected = time.format('hh:mm:ss a');
    // Combine date and time and explicitly set the timezone to 'Canada/Eastern'
    let dateTime = moment.tz(dateSelected + ' ' + timeSelected, 'DD-MM-YYYY HH:mm a', 'Canada/Eastern');
    return dateTime.toISOString();
  };

  let artsDataLink = eventData?.sameAs?.filter((item) => item?.type === sameAsTypes.ARTSDATA_IDENTIFIER);

  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  let organizerPerformerSupporterTypes = {
    organizer: 'organizer',
    performer: 'performer',
    supporter: 'supporter',
  };

  const ticketLinkOptions = [
    {
      label: 'URL',
      value: 'url',
    },
    { label: t('dashboard.events.addEditEvent.otherInformation.contact.email'), value: 'email' },
  ];

  const validateVideoLink = (rule, value) => {
    if (!value) {
      return Promise.resolve();
    }

    if (!validateYouTubeURL(value) && !validateVimeoURL(value)) {
      return Promise.reject(t('dashboard.events.addEditEvent.validations.url'));
    }

    return Promise.resolve();
  };

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

            if (!toggle) {
              notification.success({
                description: t('dashboard.events.addEditEvent.notification.saveAsDraft'),
                placement: 'top',
                closeIcon: <></>,
                maxCount: 1,
                duration: 3,
              });
              navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);
            }
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

            if (!toggle) {
              notification.success({
                description: t('dashboard.events.addEditEvent.notification.updateEvent'),
                placement: 'top',
                closeIcon: <></>,
                maxCount: 1,
                duration: 3,
              });
              navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);
            }
          })
          .catch((error) => {
            reject();
            console.log(error);
          });
      }
    });
    return promise;
  };

  const saveAsDraftHandler = (event, toggle = false, type = eventPublishState.PUBLISHED) => {
    event?.preventDefault();
    const previousShowDialog = showDialog;
    setShowDialog(false);
    const action = ({ clear = false, previousShowDialog, toggle, type }) => {
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
              ...(eventId && eventData?.publishState === eventPublishState.PUBLISHED && type !== eventPublishState.DRAFT
                ? validateFields
                : []),
            ]),
          ])
          .then(async () => {
            let fallbackStatus = activeFallbackFieldsInfo;
            if (clear) {
              dispatch(setLanguageLiteralBannerDisplayStatus(false));
              dispatch(clearActiveFallbackFieldsInfo());
              fallbackStatus = {};
            }
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
              description = {},
              name = {},
              inLanguage = [];

            let eventObj;

            const englishVirtualLocation = removeUneditedFallbackValues({
              values: values?.englishVirtualLocation?.trim(),
              activeFallbackFieldsInfo: fallbackStatus,
              fieldName: 'frenchVirtualLocation-englishVirtualLocation',
              property: 'en',
            });

            const frenchVirtualLocation = removeUneditedFallbackValues({
              values: values?.frenchVirtualLocation?.trim(),
              activeFallbackFieldsInfo: fallbackStatus,
              fieldName: 'frenchVirtualLocation-englishVirtualLocation',
              property: 'fr',
            });
            const englishContactTitle = removeUneditedFallbackValues({
              values: values?.englishContactTitle?.trim(),
              activeFallbackFieldsInfo: fallbackStatus,
              fieldName: 'frenchContactTitle-englishContactTitle',
              property: 'en',
            });
            const frenchContactTitle = removeUneditedFallbackValues({
              values: values?.frenchContactTitle?.trim(),
              activeFallbackFieldsInfo: fallbackStatus,
              fieldName: 'frenchContactTitle-englishContactTitle',
              property: 'fr',
            });

            const englishTicketNote = removeUneditedFallbackValues({
              values: values?.englishTicketNote?.trim(),
              activeFallbackFieldsInfo: fallbackStatus,
              fieldName: 'frenchTicketNote-englishTicketNote',
              property: 'en',
            });

            const frenchTicketNote = removeUneditedFallbackValues({
              values: values?.frenchTicketNote?.trim(),
              activeFallbackFieldsInfo: fallbackStatus,
              fieldName: 'frenchTicketNote-englishTicketNote',
              property: 'fr',
            });
            const descriptionFr = removeUneditedFallbackValues({
              values: values?.frenchEditor?.trim(),
              activeFallbackFieldsInfo: fallbackStatus,
              fieldName: 'frenchEditor-englishEditor',
              property: 'fr',
            });
            const descriptionEn = removeUneditedFallbackValues({
              values: values?.englishEditor?.trim(),
              activeFallbackFieldsInfo: fallbackStatus,
              fieldName: 'frenchEditor-englishEditor',
              property: 'en',
            });
            const nameFr = removeUneditedFallbackValues({
              values: values?.french?.trim(),
              activeFallbackFieldsInfo: fallbackStatus,
              fieldName: 'french-english',
              property: 'fr',
            });
            const nameEn = removeUneditedFallbackValues({
              values: values?.english?.trim(),
              activeFallbackFieldsInfo: fallbackStatus,
              fieldName: 'french-english',
              property: 'en',
            });
            // Use a regular expression to remove <p><br></p> tags at the end

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
                customDates:
                  form.getFieldsValue().frequency === 'CUSTOM' ? form.getFieldsValue().customDates : undefined,
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
              let place;
              if (
                locationPlace?.source === sourceOptions.CMS ||
                locationPlace?.source === externalSourceOptions.FOOTLIGHT
              )
                place = {
                  entityId: values?.locationPlace,
                };
              else if (locationPlace?.source === sourceOptions.ARTSDATA)
                place = {
                  uri: values?.locationPlace,
                };
              locationId = {
                place,
              };
            }
            if (values?.frenchVirtualLocation || values?.englishVirtualLocation || values?.virtualLocationOnlineLink) {
              const name = {};

              if (frenchVirtualLocation) name['fr'] = frenchVirtualLocation;
              if (englishVirtualLocation) name['en'] = englishVirtualLocation;

              locationId = {
                ...locationId,
                virtualLocation: {
                  name,
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
              const name = {};

              if (frenchContactTitle) name['fr'] = frenchContactTitle;
              if (englishContactTitle) name['en'] = englishContactTitle;

              contactPoint = {
                name,
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
                ...(values?.englishAccessibilityNote && { en: values?.englishAccessibilityNote?.trim() }),
                ...(values?.frenchAccessibilityNote && { fr: values?.frenchAccessibilityNote?.trim() }),
              };
            }

            if (values?.keywords?.length > 0) {
              keywords = values?.keywords;
            }

            if (ticketType) {
              const name = {};

              if (englishTicketNote) name['en'] = englishTicketNote;
              if (frenchTicketNote) name['fr'] = frenchTicketNote;

              offerConfiguration = {
                category: ticketType,
                ...((values?.englishTicketNote || values?.frenchTicketNote) && {
                  name,
                }),
                ...(ticketType === offerTypes.PAYING &&
                  values?.prices?.length > 0 &&
                  values?.prices[0] && {
                    prices: values?.prices?.filter((element) => element != null || element != undefined),
                  }),
                priceCurrency: 'CAD',
                ...(ticketType === offerTypes.PAYING &&
                  values?.ticketLink &&
                  values?.ticketLinkType == ticketLinkOptions[0].value && {
                    url: {
                      uri: urlProtocolCheck(values?.ticketLink),
                    },
                  }),
                ...(ticketType === offerTypes.PAYING &&
                  values?.ticketLink &&
                  values?.ticketLinkType == ticketLinkOptions[1].value && {
                    email: values?.ticketLink,
                  }),
                ...(ticketType === offerTypes.REGISTER &&
                  values?.registerLink &&
                  values?.ticketLinkType === ticketLinkOptions[0].value && {
                    url: {
                      uri: urlProtocolCheck(values?.registerLink),
                    },
                  }),
                ...(ticketType === offerTypes.REGISTER &&
                  values?.registerLink &&
                  values?.ticketLinkType === ticketLinkOptions[1].value && {
                    email: values?.registerLink,
                  }),
              };
            }

            if (values?.organizers) {
              organizers = values?.organizers?.map((organizer) => {
                if (organizer?.source === sourceOptions.CMS || organizer?.source === externalSourceOptions.FOOTLIGHT)
                  return {
                    entityId: organizer?.value,
                    type: organizer?.type,
                  };
                else if (organizer?.source === sourceOptions.ARTSDATA)
                  return {
                    uri: organizer?.uri,
                    type: organizer?.type,
                  };
              });
            }

            if (values?.performers) {
              performers = values?.performers?.map((performer) => {
                if (performer?.source === sourceOptions.CMS || performer?.source === externalSourceOptions.FOOTLIGHT)
                  return {
                    entityId: performer?.value,
                    type: performer?.type,
                  };
                else if (performer?.source === sourceOptions.ARTSDATA)
                  return {
                    uri: performer?.uri,
                    type: performer?.type,
                  };
              });
            }

            if (values?.supporters) {
              collaborators = values?.supporters?.map((supporter) => {
                if (supporter?.source === sourceOptions.CMS || supporter?.source === externalSourceOptions.FOOTLIGHT)
                  return {
                    entityId: supporter?.value,
                    type: supporter?.type,
                  };
                else if (supporter?.source === sourceOptions.ARTSDATA)
                  return {
                    uri: supporter?.uri,
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

            if (descriptionFr && descriptionFr !== '<p><br></p>')
              description = {
                fr: descriptionFr,
              };
            if (descriptionEn && descriptionEn !== '<p><br></p>')
              description = {
                ...description,
                en: descriptionEn,
              };

            if (nameEn) name['en'] = nameEn;
            if (nameFr) name['fr'] = nameFr;

            eventObj = {
              name: !(Object.keys(name).length > 0) ? { ...name, ...eventData?.name } : name,
              ...(values?.startTime && { startDateTime }),
              ...(!values?.startTime && { startDate: startDateTime }),
              ...(values?.endTime && { endDateTime }),
              ...(!values?.endTime && { endDate: endDateTime }),
              eventStatus: values?.eventStatus,
              ...((values?.englishEditor || values?.frenchEditor) && { description }),
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
              subEventConfiguration: eventData?.subEventConfiguration,
            };

            let imageCrop = [form.getFieldValue('imageCrop')];
            imageCrop = [
              {
                large: {
                  xCoordinate: imageCrop[0]?.large?.x,
                  yCoordinate: imageCrop[0]?.large?.y,
                  height: imageCrop[0]?.large?.height,
                  width: imageCrop[0]?.large?.width,
                },
                thumbnail: {
                  xCoordinate: imageCrop[0]?.thumbnail?.x,
                  yCoordinate: imageCrop[0]?.thumbnail?.y,
                  height: imageCrop[0]?.thumbnail?.height,
                  width: imageCrop[0]?.thumbnail?.width,
                },
                original: {
                  entityId: imageCrop[0]?.original?.entityId,
                  height: imageCrop[0]?.original?.height,
                  width: imageCrop[0]?.original?.width,
                },
                isMain: true,
              },
            ];

            const uploadImageList = async () => {
              for (let i = 0; i < values.multipleImagesCrop.length; i++) {
                const file = values.multipleImagesCrop[i]?.originFileObj;
                if (!file) {
                  if (values.multipleImagesCrop[i]?.cropValues)
                    imageCrop.push(values.multipleImagesCrop[i]?.cropValues);
                  else imageCrop.push(values.multipleImagesCrop[i]);
                  continue;
                }

                const formdata = new FormData();
                formdata.append('file', file);

                try {
                  const response = await addImage({ data: formdata, calendarId }).unwrap();

                  // Process each image in the list
                  const { large, thumbnail } = values.multipleImagesCrop[i]?.cropValues || {};
                  const { original, height, width } = response?.data || {};

                  const galleryImage = {
                    large: {
                      xCoordinate: large?.x,
                      yCoordinate: large?.y,
                      height: large?.height,
                      width: large?.width,
                    },
                    original: {
                      entityId: original?.entityId ?? null,
                      height,
                      width,
                    },
                    thumbnail: {
                      xCoordinate: thumbnail?.x,
                      yCoordinate: thumbnail?.y,
                      height: thumbnail?.height,
                      width: thumbnail?.width,
                    },
                  };

                  // Add the processed image to imageCrop
                  imageCrop.push(galleryImage);
                } catch (error) {
                  console.log(error);
                  throw error; // rethrow to stop further execution
                }
              }
            };

            if (values?.dragger?.length > 0 && values?.dragger[0]?.originFileObj) {
              const formdata = new FormData();
              formdata.append('file', values?.dragger[0].originFileObj);
              formdata &&
                addImage({ data: formdata, calendarId })
                  .unwrap()
                  .then(async (response) => {
                    if (featureFlags.imageCropFeature) {
                      let entityId = response?.data?.original?.entityId;
                      imageCrop = [
                        {
                          large: imageCrop[0]?.large,
                          thumbnail: imageCrop[0]?.thumbnail,
                          isMain: true,
                          original: {
                            entityId,
                            height: response?.data?.height,
                            width: response?.data?.width,
                          },
                        },
                      ];
                    } else
                      imageCrop = [
                        {
                          large: imageCrop[0]?.large,
                          thumbnail: imageCrop[0]?.thumbnail,
                          isMain: true,
                          original: {
                            entityId: response?.data?.original?.entityId,
                            height: response?.data?.height,
                            width: response?.data?.width,
                          },
                        },
                      ];

                    if (values.multipleImagesCrop?.length > 0) await uploadImageList();
                    eventObj['image'] = imageCrop;
                    addUpdateEventApiHandler(eventObj, toggle)
                      .then((id) => resolve(id))
                      .catch((error) => {
                        reject(error);

                        console.log(error);
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    const element = document.getElementsByClassName('draggerWrap');
                    element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                  });
            } else {
              if (values.multipleImagesCrop?.length > 0) await uploadImageList();
              if (values?.draggerWrap) {
                if (values?.dragger && values?.dragger?.length == 0 && values.multipleImagesCrop?.length == 0)
                  eventObj['image'] = null;
                else eventObj['image'] = imageCrop;
              }

              addUpdateEventApiHandler(eventObj, toggle)
                .then((id) => resolve(id))
                .catch((error) => {
                  reject(error);
                  console.log(error);
                });
            }
          })
          .catch((error) => {
            console.log(error);
            reject(error);
            setShowDialog(previousShowDialog);
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
    var promise = new Promise(function (resolve, reject) {
      if (Object.keys(activeFallbackFieldsInfo).length > 0 && type !== eventPublishState.DRAFT) {
        Confirm({
          title: t('dashboard.events.addEditEvent.fallbackConfirm.title'),
          content: (
            <Translation>
              {(t) => (
                <p>
                  {t('dashboard.events.addEditEvent.fallbackConfirm.contentPart1')}
                  <br></br>
                  <br></br>
                  {t('dashboard.events.addEditEvent.fallbackConfirm.contentPart2')}
                </p>
              )}
            </Translation>
          ),
          okText: t('dashboard.events.addEditEvent.fallbackConfirm.publish'),
          cancelText: t('dashboard.places.deletePlace.cancel'),
          className: 'fallback-modal-container',
          onAction: () => {
            action({ clear: true, previousShowDialog, toggle, type })
              .then((id) => {
                resolve(id);
              })
              .catch((error) => {
                reject(error);
              });
          },
        });
      } else
        action({ clear: false, previousShowDialog, toggle, type }).then((id) => {
          resolve(id);
        });
    });
    return promise;
  };

  const reviewPublishHandler = ({ event, publishState = undefined, type = 'PUBLISH' }) => {
    event?.preventDefault();

    const isValuesChanged = showDialog;
    setShowDialog(false);
    form
      .validateFields(type === 'PUBLISH' || type === 'REVIEW' ? validateFields : [])
      .then(() => {
        if (isValuesChanged && type !== 'PUBLISH') {
          saveAsDraftHandler(event, type !== 'PUBLISH', eventPublishState.DRAFT)
            .then((id) => {
              updateEventState({ id, calendarId })
                .then(() => {
                  notification.success({
                    description:
                      calendar[0]?.role === userRoles.GUEST
                        ? t('dashboard.events.addEditEvent.notification.sendToReview')
                        : eventData?.publishState === eventPublishState.DRAFT
                        ? t('dashboard.events.addEditEvent.notification.publish')
                        : t('dashboard.events.addEditEvent.notification.saveAsDraft'),
                    placement: 'top',
                    closeIcon: <></>,
                    maxCount: 1,
                    duration: 3,
                  });
                  navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);
                })
                .catch((error) => console.log(error));
            })
            .catch((error) => console.log(error));
        } else if (
          (isValuesChanged || Object.keys(activeFallbackFieldsInfo).length > 0 || duplicateId) &&
          (type === 'PUBLISH' || type === 'REVIEW')
        ) {
          saveAsDraftHandler(event, type === false)
            .then((id) => {
              updateEventState({ id: eventId ?? id, calendarId, publishState })
                .unwrap()
                .then(() => {
                  notification.success({
                    description:
                      calendar[0]?.role === userRoles.GUEST
                        ? t('dashboard.events.addEditEvent.notification.sendToReview')
                        : eventData?.publishState === eventPublishState.DRAFT
                        ? t('dashboard.events.addEditEvent.notification.publish')
                        : t('dashboard.events.addEditEvent.notification.saveAsDraft'),
                    placement: 'top',
                    closeIcon: <></>,
                    maxCount: 1,
                    duration: 3,
                  });
                  navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);
                })
                .catch((error) => console.log(error));
            })
            .catch((error) => console.log(error));
        } else {
          if (eventId) {
            updateEventState({ id: eventId, calendarId, publishState })
              .unwrap()
              .then(() => {
                notification.success({
                  description:
                    calendar[0]?.role === userRoles.GUEST
                      ? t('dashboard.events.addEditEvent.notification.sendToReview')
                      : eventData?.publishState === eventPublishState.DRAFT
                      ? t('dashboard.events.addEditEvent.notification.publish')
                      : t('dashboard.events.addEditEvent.notification.saveAsDraft'),
                  placement: 'top',
                  closeIcon: <></>,
                  maxCount: 1,
                  duration: 3,
                });
                navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);
              })
              .catch((error) => console.log(error));
          }
        }
      })
      .catch((error) => {
        console.log(error);
        setShowDialog(isValuesChanged);
        message.warning({
          duration: 10,
          maxCount: 1,
          key: 'event-review-publish-warning',
          content: (
            <>
              {calendar[0]?.role === <userRoles className="GUEST"></userRoles>
                ? t('dashboard.events.addEditEvent.validations.errorReview')
                : eventId && eventData?.publishState === eventPublishState.PUBLISHED
                ? t('dashboard.events.addEditEvent.validations.errorDraft')
                : t('dashboard.events.addEditEvent.validations.errorPublishing')}
              &nbsp;
              <Button
                type="text"
                data-cy="button-close-review-publish-warning"
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
              label={
                eventData?.publishState === eventPublishState.PENDING_REVIEW
                  ? t('dashboard.events.addEditEvent.saveOptions.revertToDraft')
                  : t('dashboard.events.addEditEvent.saveOptions.saveAsDraft')
              }
              onClick={(e) => {
                if (eventData?.publishState === eventPublishState.PENDING_REVIEW)
                  reviewPublishHandler({ event: e, publishState: eventPublishState.DRAFT });
                else saveAsDraftHandler(e, false, eventPublishState.DRAFT);
              }}
              data-cy="button-save-event"
              disabled={updateEventLoading || addEventLoading || addImageLoading ? true : false}
            />
          </Form.Item>
          <Form.Item>
            <PrimaryButton
              label={t('dashboard.events.addEditEvent.saveOptions.publish')}
              data-cy="button-publish-event"
              onClick={(e) =>
                reviewPublishHandler({ event: e, publishState: eventPublishState.PUBLISHED, type: 'PUBLISH' })
              }
              disabled={
                updateEventLoading || addEventLoading || updateEventStateLoading || addImageLoading ? true : false
              }
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
              onClick={(e) => saveAsDraftHandler(e, false, eventPublishState.DRAFT)}
              disabled={updateEventLoading || addEventLoading || addImageLoading ? true : false}
              data-cy="button-save-event"
            />
          </Form.Item>

          <Form.Item>
            <PrimaryButton
              label={t('dashboard.events.addEditEvent.saveOptions.sendToReview')}
              onClick={(e) => reviewPublishHandler({ event: e, type: 'REVIEW' })}
              data-cy="button-review-event"
              disabled={
                updateEventLoading || addEventLoading || updateEventStateLoading || addImageLoading ? true : false
              }
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
            <PublishState
              eventId={eventId}
              reviewPublishHandler={(e) => reviewPublishHandler({ event: e, type: eventPublishState.DRAFT })}>
              <span data-cy="span-published-text">{t('dashboard.events.publishState.published')}</span>
            </PublishState>
          </Form.Item>
          <Form.Item>
            <PrimaryButton
              label={t('dashboard.events.addEditEvent.saveOptions.save')}
              onClick={(e) => saveAsDraftHandler(e, false, eventPublishState.PUBLISHED)}
              disabled={updateEventLoading || addEventLoading || addImageLoading ? true : false}
              data-cy="button-save-event"
            />
          </Form.Item>
        </>
      );
    else return roleCheckHandler();
  };

  const placesSearch = (inputValue = '') => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.place);

    let sourceQuery = new URLSearchParams();
    sourceQuery.append('sources', externalSourceOptions.ARTSDATA);
    sourceQuery.append('sources', externalSourceOptions.FOOTLIGHT);
    getEntities(
      {
        searchKey: inputValue,
        classes: decodeURIComponent(query.toString()),
        calendarId,
      },
      true,
    )
      .unwrap()
      .then((response) => {
        setAllPlacesList(
          placesOptions(response, user, calendarContentLanguage, sourceOptions.CMS, currentCalendarData),
        );
      })
      .catch((error) => console.log(error));
    getExternalSource(
      {
        searchKey: inputValue,
        classes: decodeURIComponent(query.toString()),
        sources: decodeURIComponent(sourceQuery.toString()),
        calendarId,
        excludeExistingCMS: true,
      },
      true,
    )
      .unwrap()
      .then((response) => {
        setAllPlacesArtsdataList(
          placesOptions(response?.artsdata, user, calendarContentLanguage, sourceOptions.ARTSDATA, currentCalendarData),
        );
        setAllPlacesImportsFootlightList(
          placesOptions(
            response?.footlight,
            user,
            calendarContentLanguage,
            externalSourceOptions.FOOTLIGHT,
            currentCalendarData,
          ),
        );
      })
      .catch((error) => console.log(error));
  };

  const organizationPersonSearch = (value, type) => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.organization);
    query.append('classes', entitiesClass.person);

    let sourceQuery = new URLSearchParams();
    sourceQuery.append('sources', externalSourceOptions.ARTSDATA);
    sourceQuery.append('sources', externalSourceOptions.FOOTLIGHT);
    getEntities({ searchKey: value, classes: decodeURIComponent(query.toString()), calendarId }, true)
      .unwrap()
      .then((response) => {
        if (type == 'organizers') {
          setOrganizersList(
            treeEntitiesOption(response, user, calendarContentLanguage, sourceOptions.CMS, currentCalendarData),
          );
        } else if (type == 'performers') {
          setPerformerList(
            treeEntitiesOption(response, user, calendarContentLanguage, sourceOptions.CMS, currentCalendarData),
          );
        } else if (type == 'supporters') {
          setSupporterList(
            treeEntitiesOption(response, user, calendarContentLanguage, sourceOptions.CMS, currentCalendarData),
          );
        }
      })
      .catch((error) => console.log(error));
    getExternalSource(
      {
        searchKey: value,
        classes: decodeURIComponent(query.toString()),
        sources: decodeURIComponent(sourceQuery.toString()),
        calendarId,
        excludeExistingCMS: true,
      },
      true,
    )
      .unwrap()
      .then((response) => {
        if (type == 'organizers') {
          setOrganizersArtsdataList(
            treeEntitiesOption(
              response?.artsdata,
              user,
              calendarContentLanguage,
              sourceOptions.ARTSDATA,
              currentCalendarData,
            ),
          );
          setOrganizersImportsFootlightList(
            treeEntitiesOption(
              response?.footlight,
              user,
              calendarContentLanguage,
              externalSourceOptions.FOOTLIGHT,
              currentCalendarData,
            ),
          );
        } else if (type == 'performers') {
          setPerformerArtsdataList(
            treeEntitiesOption(
              response?.artsdata,
              user,
              calendarContentLanguage,
              sourceOptions.ARTSDATA,
              currentCalendarData,
            ),
          );
          setPerformerImportsFootlightList(
            treeEntitiesOption(
              response?.footlight,
              user,
              calendarContentLanguage,
              externalSourceOptions.FOOTLIGHT,
              currentCalendarData,
            ),
          );
        } else if (type == 'supporters') {
          setSupporterArtsdataList(
            treeEntitiesOption(
              response?.artsdata,
              user,
              calendarContentLanguage,
              sourceOptions.ARTSDATA,
              currentCalendarData,
            ),
          );
          setSupporterImportsFootlightList(
            treeEntitiesOption(
              response?.footlight,
              user,
              calendarContentLanguage,
              externalSourceOptions.FOOTLIGHT,
              currentCalendarData,
            ),
          );
        }
      })
      .catch((error) => console.log(error));
  };

  const debounceSearchPlace = useCallback(useDebounce(placesSearch, SEARCH_DELAY), []);
  const debounceSearchOrganizationPersonSearch = useCallback(useDebounce(organizationPersonSearch, SEARCH_DELAY), []);

  const addFieldsHandler = (fieldNames) => {
    let array = addedFields?.concat(fieldNames);
    array = [...new Set(array)];
    setAddedFields(array);
    setScrollToSelectedField(array?.at(-1));
  };

  const onValuesChangeHandler = (changedValues, allValues) => {
    if (eventId) {
      if (!updateEventSuccess) {
        //Check if the initial values are changed by quill editor
        if (changedValues?.frenchEditor || changedValues?.englishEditor) {
          if (changedValues?.frenchEditor && allValues?.frenchEditor) setShowDialog(true);
          if (changedValues?.englishEditor && allValues?.englishEditor) setShowDialog(true);
        } else if (!showDialog) setShowDialog(true);
      }
    } else {
      if (!addEventSuccess) {
        if (!showDialog) setShowDialog(true);
      }
    }
  };

  const organizerPerformerSupporterPlaceNavigationHandler = (id, type, event) => {
    saveAsDraftHandler(event, true, eventPublishState.DRAFT)
      .then((savedEventId) => {
        if ((!eventId || eventId === '') && newEventId === null)
          notification.success({
            description: t('dashboard.events.addEditEvent.notification.saveAsDraft'),
            placement: 'top',
            closeIcon: <></>,
            maxCount: 1,
            duration: 3,
          });
        else
          notification.success({
            description: t('dashboard.events.addEditEvent.notification.updateEvent'),
            placement: 'top',
            closeIcon: <></>,
            maxCount: 1,
            duration: 3,
          });

        if (type?.toUpperCase() == taxonomyClass.ORGANIZATION)
          navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}?id=${id}`, {
            state: {
              data: { isRoutingToEventPage: eventId ? location.pathname : `${location.pathname}/${savedEventId}` },
            },
          });
        else if (type?.toUpperCase() == taxonomyClass.PERSON)
          navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.AddPerson}?id=${id}`, {
            state: {
              data: { isRoutingToEventPage: eventId ? location.pathname : `${location.pathname}/${savedEventId}` },
            },
          });
        else if (type?.toUpperCase() == taxonomyClass.PLACE)
          navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.AddPlace}?id=${id}`, {
            state: {
              data: { isRoutingToEventPage: eventId ? location.pathname : `${location.pathname}/${savedEventId}` },
            },
          });
      })
      .catch((error) => console.log(error));
  };
  const FeaturedJSX = (
    <Row justify={'start'} align={'top'} gutter={[8, 0]}>
      <Col>
        <Form.Item valuePropName="checked" name="isFeatured" initialValue={eventData?.isFeatured}>
          <StyledSwitch defaultChecked={eventData?.isFeatured} />
        </Form.Item>
      </Col>
      <Col>
        <span
          style={{ color: '#222732', minHeight: '32px', display: 'flex', alignItems: 'center' }}
          data-cy="span-featured-event-text">
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
    dispatch(clearActiveFallbackFieldsInfo());
  }, []);

  useEffect(() => {
    let shouldDisplay = true;

    for (let key in activeFallbackFieldsInfo) {
      if (Object.prototype.hasOwnProperty.call(activeFallbackFieldsInfo, key)) {
        const tagDisplayStatus =
          activeFallbackFieldsInfo[key]?.en?.tagDisplayStatus || activeFallbackFieldsInfo[key]?.fr?.tagDisplayStatus;
        if (tagDisplayStatus) {
          shouldDisplay = false;
          break;
        }
      }
    }

    if (!shouldDisplay) {
      dispatch(setLanguageLiteralBannerDisplayStatus(true));
    } else {
      dispatch(setLanguageLiteralBannerDisplayStatus(false));
    }
  }, [activeFallbackFieldsInfo]);

  useEffect(() => {
    if (isError) navigate(`${PathName.NotFound}`);
  }, [isError]);

  useEffect(() => {
    if (addedFields?.length > 0) {
      if (scrollToSelectedField) {
        const element = document.getElementsByClassName(scrollToSelectedField);
        element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
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
      let initialAddedFields = [...addedFields],
        isRecurring = false;

      if (routinghandler(user, calendarId, eventData?.creator?.userId, eventData?.publishState, false) || duplicateId) {
        if (
          (eventData?.recurringEvent && Object.keys(eventData?.recurringEvent)?.length > 0) ||
          eventData?.subEventConfiguration
        )
          isRecurring = true;
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
            ['type']: entitiesClass?.place,
          };
          let taxonomyClassQuery = new URLSearchParams();
          taxonomyClassQuery.append('taxonomy-class', taxonomyClass.PLACE);
          getAllTaxonomy({
            calendarId,
            search: '',
            taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
            includeConcepts: true,
            sessionId: timestampRef,
          })
            .unwrap()
            .then((res) => {
              if (initialPlace[0]?.accessibility?.length > 0) {
                res?.data?.forEach((taxonomy) => {
                  if (taxonomy?.mappedToField === 'PlaceAccessibility') {
                    let initialPlaceAccessibiltiy = [];
                    initialPlace[0]?.accessibility?.forEach((accessibility) => {
                      taxonomy?.concept?.forEach((concept) => {
                        if (concept?.id == accessibility?.entityId) {
                          initialPlaceAccessibiltiy.push(concept);
                        }
                      });
                    });
                    initialPlace[0] = {
                      ...initialPlace[0],
                      ['accessibility']: initialPlaceAccessibiltiy,
                    };
                    setLocationPlace(
                      placesOptions(
                        initialPlace,
                        user,
                        calendarContentLanguage,
                        sourceOptions.CMS,
                        currentCalendarData,
                      )[0],
                    );
                  }
                });
              } else {
                initialPlace[0] = {
                  ...initialPlace[0],
                  ['accessibility']: [],
                };
                setLocationPlace(
                  placesOptions(initialPlace, user, calendarContentLanguage, sourceOptions.CMS, currentCalendarData)[0],
                );
              }
              res?.data?.map((taxonomy) => {
                if (taxonomy?.mappedToField == 'Region') {
                  taxonomy?.concept?.forEach((t) => {
                    if (initialPlace[0]?.regions[0]?.entityId == t?.id) {
                      initialPlace[0] = { ...initialPlace[0], regions: [t] };
                      setLocationPlace(
                        placesOptions(
                          initialPlace,
                          user,
                          calendarContentLanguage,
                          sourceOptions.CMS,
                          currentCalendarData,
                        )[0],
                      );
                    }
                  });
                }
              });
            })
            .catch((error) => console.log(error));
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
              logo: organizer?.entity?.logo,
              image: organizer?.entity?.image?.find((image) => image?.isMain),
              contactPoint: organizer?.entity?.contactPoint,
              creator: organizer?.entity?.creator,
            };
          });
          setSelectedOrganizers(
            treeEntitiesOption(
              initialOrganizers,
              user,
              calendarContentLanguage,
              sourceOptions.CMS,
              currentCalendarData,
            ),
          );
        }
        if (eventData?.performer) {
          let initialPerformers = eventData?.performer?.map((performer) => {
            return {
              disambiguatingDescription: performer?.entity?.disambiguatingDescription,
              id: performer?.entityId,
              name: performer?.entity?.name,
              type: performer?.type,
              logo: performer?.entity?.logo,
              image: performer?.entity?.image?.find((image) => image?.isMain),
              creator: performer?.entity?.creator,
            };
          });
          setSelectedPerformers(
            treeEntitiesOption(
              initialPerformers,
              user,
              calendarContentLanguage,
              sourceOptions.CMS,
              currentCalendarData,
            ),
          );
          initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.performerWrap);
        }
        if (eventData?.collaborators) {
          let initialSupporters = eventData?.collaborators?.map((supporter) => {
            return {
              disambiguatingDescription: supporter?.entity?.disambiguatingDescription,
              id: supporter?.entityId,
              name: supporter?.entity?.name,
              type: supporter?.type,
              logo: supporter?.entity?.logo,
              image: supporter?.entity?.image?.find((image) => image?.isMain),
              creator: supporter?.entity?.creator,
            };
          });
          setSelectedSupporters(
            treeEntitiesOption(
              initialSupporters,
              user,
              calendarContentLanguage,
              sourceOptions.CMS,
              currentCalendarData,
            ),
          );
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
        if (eventData?.subEventConfiguration) {
          form.setFieldsValue({
            frequency: 'CUSTOM',
            startDateRecur: [
              moment(
                moment(eventData?.startDate ?? eventData?.startDateTime, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                'DD-MM-YYYY',
              ),
              moment(
                moment(eventData?.endDate ?? eventData?.endDateTime, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                'DD-MM-YYYY',
              ),
            ],
            startTimeRecur: null,
            endTimeRecur: null,
            customDates: groupEventsByDate(eventData?.subEventConfiguration),
          });
          const obj = {
            frequency: 'CUSTOM',
            startDateRecur: [
              moment(
                moment(eventData?.startDate ?? eventData?.startDateTime, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                'DD-MM-YYYY',
              ),
              moment(
                moment(eventData?.endDate ?? eventData?.endDateTime, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                'DD-MM-YYYY',
              ),
            ],
            startTimeRecur: null,
          };
          setFormValue(obj);
        }
        if (eventData?.image?.length > 0) {
          const mainImage = eventData.image.find((image) => image?.isMain) || null;
          const imageGalleryImages = eventData.image.filter((image) => !image?.isMain);

          if (mainImage) {
            form.setFieldsValue({
              imageCrop: {
                large: {
                  x: mainImage?.large?.xCoordinate,
                  y: mainImage?.large?.yCoordinate,
                  height: mainImage?.large?.height,
                  width: mainImage?.large?.width,
                },
                original: {
                  entityId: mainImage?.original?.entityId ?? null,
                  height: mainImage?.original?.height,
                  width: mainImage?.original?.width,
                },
                thumbnail: {
                  x: mainImage?.thumbnail?.xCoordinate,
                  y: mainImage?.thumbnail?.yCoordinate,
                  height: mainImage?.thumbnail?.height,
                  width: mainImage?.thumbnail?.width,
                },
              },
            });
          }

          if (imageGalleryImages.length > 0) {
            const galleryImages = imageGalleryImages.map((image) => ({
              large: {
                x: image?.large?.xCoordinate,
                y: image?.large?.yCoordinate,
                height: image?.large?.height,
                width: image?.large?.width,
              },
              original: {
                entityId: image?.original?.entityId ?? null,
                height: image?.original?.height,
                width: image?.original?.width,
              },
              thumbnail: {
                x: image?.thumbnail?.xCoordinate,
                y: image?.thumbnail?.yCoordinate,
                height: image?.thumbnail?.height,
                width: image?.thumbnail?.width,
              },
            }));

            form.setFieldsValue({
              multipleImagesCrop: galleryImages,
            });
          }
        }
      } else {
        navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}/${eventId}`, {
          replace: true,
        });
      }
    }
  }, [isLoading, currentCalendarData]);

  useEffect(() => {
    if (currentCalendarData) {
      let publishValidateFields = [],
        initialAddedFields = [];
      requiredFields?.map((requiredField) => {
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

            setDescriptionMinimumWordCount(
              requiredField?.rule?.minimumWordCount ? Number(requiredField?.rule?.minimumWordCount) : 1,
            );
            break;
          case eventFormRequiredFieldNames.DESCRIPTION_EN:
            publishValidateFields.push('englishEditor');
            setDescriptionMinimumWordCount(
              requiredField?.rule?.minimumWordCount ? Number(requiredField?.rule?.minimumWordCount) : 1,
            );
            break;
          case eventFormRequiredFieldNames.DESCRIPTION_FR:
            publishValidateFields.push('frenchEditor');
            setDescriptionMinimumWordCount(
              requiredField?.rule?.minimumWordCount ? Number(requiredField?.rule?.minimumWordCount) : 1,
            );
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
          case eventFormRequiredFieldNames.VIRTUAL_LOCATION:
            initialAddedFields = initialAddedFields?.concat(locationType?.fieldNames);
            publishValidateFields.push('location-form-wrapper');
            break;
          case eventFormRequiredFieldNames.IMAGE:
            publishValidateFields.push('draggerWrap');
            break;
          case eventFormRequiredFieldNames.ORGANIZERS:
            publishValidateFields.push('organizers');
            break;
          case eventFormRequiredFieldNames.EVENT_STATUS:
            publishValidateFields.push('eventStatus');
            break;
          case eventFormRequiredFieldNames.CONTACT_TITLE:
            publishValidateFields.push('englishContactTitle', 'frenchContactTitle');
            initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.contact);
            break;
          case eventFormRequiredFieldNames.CONTACT_WEBSITE:
            publishValidateFields.push('contactWebsiteUrl');
            initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.contact);
            break;
          case eventFormRequiredFieldNames.PHONE_NUMBER:
            publishValidateFields.push('contactPhoneNumber');
            initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.contact);
            break;
          case eventFormRequiredFieldNames.EMAIL:
            publishValidateFields.push('contactEmail');
            initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.contact);
            break;
          case eventFormRequiredFieldNames.PERFORMER:
            publishValidateFields.push('performers');
            initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.performerWrap);
            break;
          case eventFormRequiredFieldNames.COLLABORATOR:
            publishValidateFields.push('supporters');
            initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.supporterWrap);

            break;
          case eventFormRequiredFieldNames.EVENT_LINK:
            publishValidateFields.push(otherInformationFieldNames.eventLink);
            initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.eventLink);
            break;
          case eventFormRequiredFieldNames.VIDEO_URL:
            publishValidateFields.push(otherInformationFieldNames.videoLink);
            initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.videoLink);
            break;
          case eventFormRequiredFieldNames.FACEBOOK_URL:
            publishValidateFields.push(otherInformationFieldNames.facebookLink);
            initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.facebookLinkWrap);

            break;
          case eventFormRequiredFieldNames.KEYWORDS:
            publishValidateFields.push(otherInformationFieldNames.keywords);
            initialAddedFields = initialAddedFields?.concat(otherInformationFieldNames?.keywords);

            break;
          case eventFormRequiredFieldNames.EVENT_ACCESSIBILITY:
            publishValidateFields.push('eventAccessibility');
            initialAddedFields = initialAddedFields?.concat(eventAccessibilityFieldNames?.noteWrap);

            break;
          default:
            publishValidateFields.push(['dynamicFields', requiredField?.fieldName]);
            break;
        }
      });
      publishValidateFields = [...new Set(publishValidateFields)];
      setValidateFields(publishValidateFields);
      setAddedFields(initialAddedFields);
    }
  }, [currentCalendarData]);

  useEffect(() => {
    if (isReadOnly) {
      if (eventId) navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}/${eventId}`, { replace: true });
      else navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`, { replace: true });
    }
  }, [isReadOnly]);

  return !isLoading &&
    !taxonomyLoading &&
    currentCalendarData &&
    !updateEventLoading &&
    !addEventLoading &&
    !updateEventStateLoading ? (
    <div>
      <Prompt when={showDialog} message={t('common.unsavedChanges')} beforeUnload={true} />
      <Form
        form={form}
        layout="vertical"
        name="event"
        onValuesChange={onValuesChangeHandler}
        onFieldsChange={() => {
          setFormValue(form.getFieldsValue(true));
        }}>
        <Row gutter={[32, 24]} className="add-edit-wrapper event-form-wrapper">
          <Col span={24}>
            <Row justify="space-between" gutter={16}>
              <Col>
                <div className="add-edit-event-heading">
                  <h4 data-cy="heading-new-edit-event">
                    {eventId
                      ? t('dashboard.events.addEditEvent.heading.editEvent')
                      : t('dashboard.events.addEditEvent.heading.newEvent')}
                  </h4>
                </div>
              </Col>
              <Col style={{ marginLeft: 'auto' }}>
                <div className="add-event-button-wrap">
                  <ButtonDisplayHandler />
                </div>
              </Col>
            </Row>
          </Col>
          {eventData?.publishState === eventPublishState.DRAFT &&
            eventData?.reviewFailed &&
            calendar[0]?.role === userRoles.GUEST &&
            eventData?.creator?.userId == user?.id && (
              <Col span={24}>
                <Row>
                  <Col flex={'780px'}>
                    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                      <Col span={24} style={{ margin: ' 0 16px' }}>
                        <Alert
                          message={t('dashboard.events.addEditEvent.notification.editFailedReviewForGuest')}
                          type="info"
                          showIcon
                          icon={<InfoCircleOutlined style={{ color: '#EDAB01', fontSize: '21px' }} />}
                          additionalClassName="alert-warning"
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            )}

          {languageLiteralBannerDisplayStatus && (
            <Col span={24} className="language-literal-banner">
              <Row>
                <Col flex={'780px'}>
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col span={24}>
                      <Alert
                        message={t('common.forms.languageLiterals.bannerTitle')}
                        type="info"
                        showIcon={false}
                        action={
                          <OutlinedButton
                            data-cy="button-change-fallback-banner"
                            size="large"
                            label={t('common.dismiss')}
                            onClick={() => {
                              dispatch(setLanguageLiteralBannerDisplayStatus(false));
                              dispatch(clearActiveFallbackFieldsInfo({}));
                            }}
                          />
                        }
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          )}

          <CardEvent marginTop="5%" marginResponsive="0px">
            <>
              {artsDataLink?.length > 0 && (
                <Row>
                  <Col span={24}>
                    <p className="add-entity-label" data-cy="para-place-data-source">
                      {t('dashboard.events.addEditEvent.dataSource')}
                    </p>
                  </Col>
                  <Col span={24}>
                    <ArtsDataInfo
                      artsDataLink={artsDataLinkChecker(artsDataLink[0]?.uri)}
                      name={contentLanguageBilingual({
                        en: eventData?.name?.en,
                        fr: eventData?.name?.fr,
                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                        calendarContentLanguage: calendarContentLanguage,
                      })}
                      disambiguatingDescription={contentLanguageBilingual({
                        en: eventData?.disambiguatingDescription?.en,
                        fr: eventData?.disambiguatingDescription?.fr,
                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                        calendarContentLanguage: calendarContentLanguage,
                      })}
                    />
                  </Col>
                  <Col span={24}>
                    <div style={{ display: 'inline' }}>
                      <span className="add-event-date-heading" data-cy="span-place-question-part-one">
                        {t('dashboard.events.addEditEvent.question.firstPart')}
                      </span>
                      <span
                        data-cy="span-place-question-part-two"
                        className="add-event-date-heading"
                        style={{
                          color: '#1b3de6',
                          textDecoration: 'underline',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          window.location.pathname = `${PathName.Dashboard}/${calendarId}${PathName.Events}${PathName.AddEvent}`;
                        }}>
                        {t('dashboard.events.addEditEvent.question.secondPart')}
                      </span>
                      <span className="add-event-date-heading" data-cy="span-place-question-part-three">
                        {t('dashboard.events.addEditEvent.question.thirdPart')}
                      </span>
                    </div>
                  </Col>
                  <Col span={24}>
                    <div>
                      <br />
                    </div>
                  </Col>
                </Row>
              )}
              <Form.Item
                label={t('dashboard.events.addEditEvent.language.title')}
                hidden={
                  standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.NAME) ||
                  standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.NAME_EN) ||
                  standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.NAME_FR)
                    ? adminCheckHandler({ calendar, user })
                      ? false
                      : true
                    : false
                }
                required={
                  requiredFieldNames?.includes(eventFormRequiredFieldNames?.NAME) ||
                  requiredFieldNames?.includes(eventFormRequiredFieldNames?.NAME_EN) ||
                  requiredFieldNames?.includes(eventFormRequiredFieldNames?.NAME_FR)
                }>
                <ContentLanguageInput
                  calendarContentLanguage={calendarContentLanguage}
                  isFieldsDirty={{ en: form.isFieldTouched('english'), fr: form.isFieldTouched('french') }}>
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
                        style={{
                          borderRadius: '4px',
                          border: `${
                            calendarContentLanguage === contentLanguage.BILINGUAL
                              ? '4px solid #E8E8E8'
                              : '1px solid #b6c1c9'
                          }`,
                          width: '423px',
                        }}
                        size="large"
                        data-cy="text-area-event-french-name"
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
                        style={{
                          borderRadius: '4px',
                          border: `${
                            calendarContentLanguage === contentLanguage.BILINGUAL
                              ? '4px solid #E8E8E8'
                              : '1px solid #b6c1c9'
                          }`,
                          width: '423px',
                        }}
                        size="large"
                        data-cy="text-area-event-english-name"
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
                      ? adminCheckHandler({ calendar, user })
                        ? false
                        : true
                      : false
                  }
                  style={{
                    display: !taxonomyDetails(allTaxonomyData?.data, user, 'EventType', 'name', false) && 'none',
                  }}
                  rules={[
                    {
                      required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.EVENT_TYPE),
                      message: t('dashboard.events.addEditEvent.validations.eventType'),
                    },
                  ]}
                  data-cy="form-item-event-type-label">
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
                          closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}
                          data-cy={`tag-event-type-${label}`}>
                          {label}
                        </Tags>
                      );
                    }}
                    data-cy="treeselect-event-type"
                  />
                </Form.Item>
                <Form.Item
                  name="targetAudience"
                  label={taxonomyDetails(allTaxonomyData?.data, user, 'Audience', 'name', false)}
                  initialValue={eventData?.audience?.map((audience) => {
                    return audience?.entityId;
                  })}
                  style={{
                    display: !taxonomyDetails(allTaxonomyData?.data, user, 'Audience', 'name', false) && 'none',
                  }}
                  hidden={
                    standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.AUDIENCE)
                      ? adminCheckHandler({ calendar, user })
                        ? false
                        : true
                      : false
                  }
                  rules={[
                    {
                      required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.AUDIENCE),
                      message: t('dashboard.events.addEditEvent.validations.targetAudience'),
                    },
                  ]}
                  data-cy="form-item-audience-label">
                  <TreeSelectOption
                    allowClear
                    treeDefaultExpandAll
                    notFoundContent={<NoContent />}
                    clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                    treeData={treeTaxonomyOptions(allTaxonomyData, user, 'Audience', false, calendarContentLanguage)}
                    placeholder={t('dashboard.events.addEditEvent.language.placeHolderTargetAudience')}
                    data-cy="treeselect-audience"
                    tagRender={(props) => {
                      const { closable, onClose, label } = props;
                      return (
                        <Tags
                          data-cy={`tag-audience-${label}`}
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
                        initialValue={
                          dynamicAdminOnlyFields?.includes(taxonomy?.id)
                            ? adminCheckHandler({ calendar, user })
                              ? initialValues
                              : []
                            : initialValues
                        }
                        hidden={
                          dynamicAdminOnlyFields?.includes(taxonomy?.id)
                            ? adminCheckHandler({ calendar, user })
                              ? false
                              : true
                            : false
                        }
                        data-cy={`form-item-${taxonomy?.id}`}
                        rules={[
                          {
                            required: requiredFieldNames?.includes(taxonomy?.id),
                            message: t('common.validations.informationRequired'),
                          },
                        ]}>
                        <TreeSelectOption
                          allowClear
                          treeDefaultExpandAll
                          notFoundContent={<NoContent />}
                          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                          treeData={treeDynamicTaxonomyOptions(taxonomy?.concept, user, calendarContentLanguage)}
                          data-cy={`treeselect-${taxonomy?.id}`}
                          tagRender={(props) => {
                            const { label, closable, onClose } = props;
                            return (
                              <Tags
                                data-cy={`tag-${taxonomy?.id}`}
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
            </>
            <div>
              {standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.FEATURED)
                ? adminCheckHandler({ calendar, user })
                  ? FeaturedJSX
                  : null
                : FeaturedJSX}
            </div>
          </CardEvent>
          <CardEvent title={t('dashboard.events.addEditEvent.dates.dates')} required={true} marginResponsive="0px">
            <>
              {!dateType ? (
                <Row>
                  <Col>
                    <p className="add-event-date-heading" data-cy="heading-dates">
                      {t('dashboard.events.addEditEvent.dates.heading')}
                    </p>
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
                                ? adminCheckHandler({ calendar, user })
                                  ? false
                                  : true
                                : false
                            }
                            rules={[
                              {
                                required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.START_DATE),
                                message: t('dashboard.events.addEditEvent.validations.date'),
                              },
                            ]}
                            data-cy="form-item-event-single-date-label">
                            <DatePickerStyled style={{ width: '423px' }} data-cy="single-date-event" />
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
                                }
                                data-cy="form-item-single-date-start-time-label">
                                <TimePickerStyled
                                  placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                                  use12Hours={i18n?.language === 'en' ? true : false}
                                  format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                                  onSelect={(value) => {
                                    form.setFieldsValue({
                                      startTime: value,
                                    });
                                  }}
                                  data-cy="single-date-start-time"
                                />
                              </Form.Item>
                            </Col>
                            <Col flex={'203.5px'}>
                              <Form.Item
                                name="endTime"
                                label={t('dashboard.events.addEditEvent.dates.endTime')}
                                initialValue={
                                  eventData?.endDateTime
                                    ? moment.tz(eventData?.endDateTime, eventData?.scheduleTimezone ?? 'Canada/Eastern')
                                    : undefined
                                }
                                data-cy="form-item-single-date-end-time-label">
                                <TimePickerStyled
                                  placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                                  use12Hours={i18n?.language === 'en' ? true : false}
                                  format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                                  onSelect={(value) => {
                                    form.setFieldsValue({
                                      endTime: value,
                                    });
                                  }}
                                  data-cy="single-date-end-time"
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
                              ? adminCheckHandler({ calendar, user })
                                ? false
                                : true
                              : false
                          }
                          rules={[
                            {
                              required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.START_DATE),
                              message: t('dashboard.events.addEditEvent.validations.date'),
                            },
                          ]}
                          data-cy="form-item-date-range-label">
                          <DateRangePicker style={{ width: '100%' }} data-cy="date-range" />
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
                          data-cy="button-select-single-date"
                        />
                        <DateAction
                          iconrender={<CalendarOutlined />}
                          label={t('dashboard.events.addEditEvent.dates.dateRange')}
                          onClick={() => setDateType(dateTypes.RANGE)}
                          data-cy="button-select-date-range"
                        />
                        <DateAction
                          iconrender={<CalendarOutlined />}
                          label={t('dashboard.events.addEditEvent.dates.multipleDates')}
                          onClick={() => setDateType(dateTypes.MULTIPLE)}
                          data-cy="button-select-multiple-date"
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
                    initialValue={eventData?.eventStatus ?? eventStatus.EventScheduled}
                    data-cy="form-item-event-status-label"
                    rules={[
                      {
                        required: requiredFieldNames?.includes(eventFormRequiredFieldNames.EVENT_STATUS),
                        message: t('common.validations.informationRequired'),
                      },
                    ]}>
                    <Select options={eventStatusOptions} data-cy="select-event-status" />
                  </Form.Item>
                </Col>
              </Row>
            </>

            {dateType && (
              <ChangeTypeLayout>
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
              </ChangeTypeLayout>
            )}
          </CardEvent>
          <CardEvent
            marginResponsive="0px"
            title={t('dashboard.events.addEditEvent.location.title')}
            required={
              requiredFieldNames?.includes(eventFormRequiredFieldNames?.LOCATION) ||
              requiredFieldNames?.includes(eventFormRequiredFieldNames?.VIRTUAL_LOCATION)
            }>
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
                initialValue={initialPlace && initialPlace[0]?.id}
                label={t('dashboard.events.addEditEvent.location.title')}
                hidden={
                  standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.LOCATION)
                    ? adminCheckHandler({ calendar, user })
                      ? false
                      : true
                    : false
                }
                data-cy="form-item-place-label">
                <KeyboardAccessibleLayout
                  setItem={setLocationPlace}
                  data={[allPlacesList, allPlacesImportsFootlightList, allPlacesArtsdataList]}
                  setFieldValue={(selectedItem) => form.setFieldValue('locationPlace', selectedItem)}
                  popOverHandler={() => setIsPopoverOpen({ ...isPopoverOpen, locationPlace: false })}
                  isPopoverOpen={isPopoverOpen.locationPlace}>
                  <CustomPopover
                    open={isPopoverOpen.locationPlace}
                    onOpenChange={(open) => {
                      debounceSearchPlace(quickCreateKeyword);
                      setIsPopoverOpen({ ...isPopoverOpen, locationPlace: open });
                    }}
                    destroyTooltipOnHide={true}
                    overlayClassName="event-popover"
                    placement="bottom"
                    autoAdjustOverflow={false}
                    getPopupContainer={(trigger) => trigger.parentNode}
                    trigger={['click']}
                    data-cy="popover-event-place"
                    content={
                      <div>
                        <div>
                          <>
                            <div className="popover-section-header" data-cy="div-place-footlight-title">
                              {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                            </div>
                            <div className="search-scrollable-content">
                              {isEntitiesFetching && (
                                <div
                                  style={{
                                    height: '200px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                  <LoadingIndicator />
                                </div>
                              )}
                              {!isEntitiesFetching &&
                                (allPlacesList?.length > 0 ? (
                                  allPlacesList?.map((place, index) => (
                                    <div
                                      key={index}
                                      className="event-popover-options"
                                      onClick={() => {
                                        setLocationPlace(place);
                                        form.setFieldValue('locationPlace', place?.value);
                                        setShowDialog(true);
                                        setIsPopoverOpen({
                                          ...isPopoverOpen,
                                          locationPlace: false,
                                        });
                                      }}
                                      data-cy={`div-select-place-${index}`}>
                                      {place?.label}
                                    </div>
                                  ))
                                ) : (
                                  <NoContent />
                                ))}
                            </div>
                          </>
                          {quickCreateKeyword !== '' && (
                            <>
                              <div className="popover-section-header" data-cy="div-place-artsdata-title">
                                {t('dashboard.organization.createNew.search.importsFromFootlight')}
                              </div>
                              <div className="search-scrollable-content">
                                {isExternalSourceFetching && (
                                  <div
                                    style={{
                                      height: '200px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    <LoadingIndicator />
                                  </div>
                                )}
                                {!isExternalSourceFetching &&
                                  (allPlacesImportsFootlightList?.length > 0 ? (
                                    allPlacesImportsFootlightList?.map((place, index) => (
                                      <div
                                        key={index}
                                        className="event-popover-options event-popover-options-arts-data"
                                        onClick={() => {
                                          setLocationPlace(place);
                                          form.setFieldValue('locationPlace', place?.value);
                                          setShowDialog(true);
                                          setIsPopoverOpen({
                                            ...isPopoverOpen,
                                            locationPlace: false,
                                          });
                                        }}
                                        data-cy={`div-select-import-footlight-data-place-${index}`}>
                                        {place?.label}
                                      </div>
                                    ))
                                  ) : (
                                    <NoContent />
                                  ))}
                              </div>
                            </>
                          )}
                          {quickCreateKeyword !== '' && (
                            <>
                              <div className="popover-section-header" data-cy="div-place-artsdata-title">
                                {t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                              </div>
                              <div className="search-scrollable-content">
                                {isExternalSourceFetching && (
                                  <div
                                    style={{
                                      height: '200px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    <LoadingIndicator />
                                  </div>
                                )}
                                {!isExternalSourceFetching &&
                                  (allPlacesArtsdataList?.length > 0 ? (
                                    allPlacesArtsdataList?.map((place, index) => (
                                      <div
                                        key={index}
                                        className="event-popover-options event-popover-options-arts-data"
                                        onClick={() => {
                                          setLocationPlace(place);
                                          form.setFieldValue('locationPlace', place?.uri);
                                          setShowDialog(true);
                                          setIsPopoverOpen({
                                            ...isPopoverOpen,
                                            locationPlace: false,
                                          });
                                        }}
                                        data-cy={`div-select-arts-data-place-${index}`}>
                                        {place?.label}
                                      </div>
                                    ))
                                  ) : (
                                    <NoContent />
                                  ))}
                              </div>
                            </>
                          )}
                        </div>
                        <FeatureFlag isFeatureEnabled={featureFlags.quickCreatePersonPlace}>
                          {quickCreateKeyword?.length > 0 && (
                            <div
                              className="quick-create"
                              onClick={() => {
                                setIsPopoverOpen({ ...isPopoverOpen, locationPlace: false });
                                setQuickCreatePlaceModal(true);
                              }}
                              data-cy="div-select-quick-create-keyword">
                              <PlusCircleOutlined />
                              &nbsp;{t('dashboard.events.addEditEvent.quickCreate.create')}&nbsp;&#34;
                              {quickCreateKeyword}&#34;
                            </div>
                          )}
                        </FeatureFlag>
                      </div>
                    }>
                    <EventsSearch
                      style={{ borderRadius: '4px', width: '423px' }}
                      placeholder={t('dashboard.events.addEditEvent.location.placeHolderLocation')}
                      onChange={(e) => {
                        setQuickCreateKeyword(e.target.value);
                        debounceSearchPlace(e.target.value);
                        setIsPopoverOpen({ ...isPopoverOpen, locationPlace: true });
                      }}
                      onClick={(e) => {
                        setQuickCreateKeyword(e.target.value);
                        setIsPopoverOpen({ ...isPopoverOpen, locationPlace: true });
                      }}
                      data-cy="input-quick-create-keyword-place"
                    />
                  </CustomPopover>
                </KeyboardAccessibleLayout>
                {locationPlace && (
                  <SelectionItem
                    icon={locationPlace?.label?.props?.icon}
                    fallbackConfig={locationPlace?.fallBackStatus}
                    name={locationPlace?.name}
                    description={locationPlace?.description}
                    itemWidth="100%"
                    postalAddress={locationPlace?.postalAddress}
                    accessibility={locationPlace?.accessibility}
                    openingHours={locationPlace?.openingHours}
                    calendarContentLanguage={calendarContentLanguage}
                    region={locationPlace?.region}
                    bordered
                    closable
                    onClose={() => {
                      setLocationPlace();
                      setShowDialog(true);
                      form.setFieldValue('locationPlace', undefined);
                    }}
                    edit={locationPlace?.source === sourceOptions.CMS && true}
                    onEdit={(e) =>
                      organizerPerformerSupporterPlaceNavigationHandler(locationPlace?.value, locationPlace?.type, e)
                    }
                    creatorId={locationPlace?.creatorId}
                  />
                )}
                <QuickCreatePlace
                  open={quickCreatePlaceModal}
                  setOpen={setQuickCreatePlaceModal}
                  calendarId={calendarId}
                  keyword={quickCreateKeyword}
                  setKeyword={setQuickCreateKeyword}
                  interfaceLanguage={user?.interfaceLanguage?.toLowerCase()}
                  calendarContentLanguage={calendarContentLanguage}
                  setLocationPlace={setLocationPlace}
                  locationPlace={locationPlace}
                  eventForm={form}
                  saveAsDraftHandler={saveAsDraftHandler}
                  setLoaderModalOpen={setLoaderModalOpen}
                  loaderModalOpen={loaderModalOpen}
                  setShowDialog={setShowDialog}
                />
              </Form.Item>
              <Form.Item
                label={t('dashboard.events.addEditEvent.location.virtualLocation')}
                name={virtualLocationFieldNames.virtualLocationName}
                className={virtualLocationFieldNames.virtualLocationName}
                style={{
                  display: !addedFields?.includes(virtualLocationFieldNames.virtualLocationName) && 'none',
                }}
                data-cy="form-item-virtual-location-title">
                <ContentLanguageInput
                  calendarContentLanguage={calendarContentLanguage}
                  isFieldsDirty={{
                    en: form.isFieldTouched('englishVirtualLocation'),
                    fr: form.isFieldTouched('frenchVirtualLocation'),
                  }}>
                  <BilingualInput fieldData={initialVirtualLocation && initialVirtualLocation[0]?.name}>
                    <Form.Item
                      name="frenchVirtualLocation"
                      key={contentLanguage.FRENCH}
                      initialValue={initialVirtualLocation && initialVirtualLocation[0]?.name?.fr}
                      data-cy="form-item-virtual-location-french">
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.location.placeHolderVirtualLocationFr')}
                        style={{
                          borderRadius: '4px',
                          border: `${
                            calendarContentLanguage === contentLanguage.BILINGUAL
                              ? '4px solid #E8E8E8'
                              : '1px solid #b6c1c9'
                          }`,
                          width: '423px',
                        }}
                        size="large"
                        data-cy="text-area-virtual-location-french"
                      />
                    </Form.Item>
                    <Form.Item
                      name="englishVirtualLocation"
                      key={contentLanguage.ENGLISH}
                      initialValue={initialVirtualLocation && initialVirtualLocation[0]?.name?.en}
                      data-cy="form-item-virtual-location-english">
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.location.placeHolderVirtualLocationEn')}
                        style={{
                          borderRadius: '4px',
                          border: `${
                            calendarContentLanguage === contentLanguage.BILINGUAL
                              ? '4px solid #E8E8E8'
                              : '1px solid #b6c1c9'
                          }`,
                          width: '423px',
                        }}
                        size="large"
                        data-cy="text-area-virtual-location-english"
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
                ]}
                data-cy="form-item-virtual-location-link-title">
                <StyledInput
                  addonBefore="URL"
                  autoComplete="off"
                  placeholder={t('dashboard.events.addEditEvent.location.placeHolderOnlineLink')}
                  data-cy="input-virtual-location-link"
                />
              </Form.Item>
            </Form.Item>

            <ChangeTypeLayout>
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
            </ChangeTypeLayout>
          </CardEvent>
          <CardEvent title={t('dashboard.events.addEditEvent.otherInformation.title')} marginResponsive="0px">
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
                    ? adminCheckHandler({ calendar, user })
                      ? false
                      : true
                    : false
                }
                data-cy="form-item-description-title">
                <ContentLanguageInput
                  calendarContentLanguage={calendarContentLanguage}
                  isFieldsDirty={{
                    en: form.isFieldTouched('englishEditor'),
                    fr: form.isFieldTouched('frenchEditor'),
                  }}>
                  <BilingualInput fieldData={eventData?.description}>
                    <TextEditor
                      formName="frenchEditor"
                      key={contentLanguage.FRENCH}
                      calendarContentLanguage={calendarContentLanguage}
                      initialValue={
                        eventData?.description?.fr ? removeEmptyParagraphsAtEnd(eventData?.description?.fr) : undefined
                      }
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
                                      t('dashboard.events.addEditEvent.validations.otherInformation.emptyDescription', {
                                        wordCount: descriptionMinimumWordCount,
                                      }),
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
                      initialValue={
                        eventData?.description?.en ? removeEmptyParagraphsAtEnd(eventData?.description?.en) : undefined
                      }
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
                                      t('dashboard.events.addEditEvent.validations.otherInformation.emptyDescription', {
                                        wordCount: descriptionMinimumWordCount,
                                      }),
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
                label={t('dashboard.events.addEditEvent.otherInformation.organizer.title')}
                required={requiredFieldNames?.includes(eventFormRequiredFieldNames?.ORGANIZERS)}
                data-cy="form-item-organizer-title">
                <Row>
                  <Col>
                    <p className="add-event-date-heading" data-cy="para-organizer-subheading">
                      {t('dashboard.events.addEditEvent.otherInformation.organizer.subHeading')}
                    </p>
                  </Col>
                </Row>
                <Form.Item
                  name="organizers"
                  initialValue={selectedOrganizers}
                  required={requiredFieldNames?.includes(eventFormRequiredFieldNames?.ORGANIZERS)}
                  rules={[
                    () => ({
                      validator() {
                        if (requiredFieldNames?.includes(eventFormRequiredFieldNames?.ORGANIZERS)) {
                          if (selectedOrganizers?.length > 0) {
                            return Promise.resolve();
                          } else
                            return Promise.reject(
                              new Error(t('dashboard.events.addEditEvent.validations.organizer.required')),
                            );
                        }
                      },
                    }),
                  ]}>
                  <KeyboardAccessibleLayout
                    setItem={(organizer) => setSelectedOrganizers([...selectedOrganizers, organizer])}
                    data={[organizersList, organizersImportsFootlightList, organizersArtsdataList]}
                    setFieldValue={() => {
                      return;
                    }}
                    popOverHandler={() => setIsPopoverOpen({ ...isPopoverOpen, organizer: false })}
                    isPopoverOpen={isPopoverOpen.organizer}>
                    <CustomPopover
                      open={isPopoverOpen.organizer}
                      onOpenChange={(open) => {
                        debounceSearchOrganizationPersonSearch(quickCreateKeyword, 'organizers');
                        setIsPopoverOpen({ ...isPopoverOpen, organizer: open });
                      }}
                      destroyTooltipOnHide={true}
                      overlayClassName="event-popover"
                      placement="bottom"
                      autoAdjustOverflow={false}
                      getPopupContainer={(trigger) => trigger.parentNode}
                      trigger={['click']}
                      data-cy="popover-organizers"
                      content={
                        <div>
                          <div>
                            <>
                              <div className="popover-section-header" data-cy="div-organizers-footlight-entity-heading">
                                {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                              </div>
                              <div className="search-scrollable-content">
                                {isEntitiesFetching && (
                                  <div
                                    style={{
                                      height: '200px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    <LoadingIndicator />
                                  </div>
                                )}
                                {!isEntitiesFetching &&
                                  (organizersList?.length > 0 ? (
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
                                        }}
                                        data-cy={`div-select-organizer-${index}`}>
                                        {organizer?.label}
                                      </div>
                                    ))
                                  ) : (
                                    <NoContent />
                                  ))}
                              </div>
                            </>
                            {quickCreateKeyword !== '' && (
                              <>
                                <div
                                  className="popover-section-header"
                                  data-cy="div-organizers-artsdata-entity-heading">
                                  {t('dashboard.organization.createNew.search.importsFromFootlight')}
                                </div>
                                <div className="search-scrollable-content">
                                  {isExternalSourceFetching && (
                                    <div
                                      style={{
                                        height: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                      <LoadingIndicator />
                                    </div>
                                  )}
                                  {!isExternalSourceFetching &&
                                    (organizersImportsFootlightList?.length > 0 ? (
                                      organizersImportsFootlightList?.map((organizer, index) => (
                                        <div
                                          key={index}
                                          className="event-popover-options"
                                          onClick={() => {
                                            setSelectedOrganizers([...selectedOrganizers, organizer]);
                                            setIsPopoverOpen({
                                              ...isPopoverOpen,
                                              organizer: false,
                                            });
                                          }}
                                          data-cy={`div-select-import-footlight-organizer-${index}`}>
                                          {organizer?.label}
                                        </div>
                                      ))
                                    ) : (
                                      <NoContent />
                                    ))}
                                </div>
                              </>
                            )}
                            {quickCreateKeyword !== '' && (
                              <>
                                <div
                                  className="popover-section-header"
                                  data-cy="div-organizers-artsdata-entity-heading">
                                  {t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                                </div>
                                <div className="search-scrollable-content">
                                  {isExternalSourceFetching && (
                                    <div
                                      style={{
                                        height: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                      <LoadingIndicator />
                                    </div>
                                  )}
                                  {!isExternalSourceFetching &&
                                    (organizersArtsdataList?.length > 0 ? (
                                      organizersArtsdataList?.map((organizer, index) => (
                                        <div
                                          key={index}
                                          className="event-popover-options"
                                          onClick={() => {
                                            setSelectedOrganizers([...selectedOrganizers, organizer]);
                                            setIsPopoverOpen({
                                              ...isPopoverOpen,
                                              organizer: false,
                                            });
                                          }}
                                          data-cy={`div-select-artsdata-organizer-${index}`}>
                                          {organizer?.label}
                                        </div>
                                      ))
                                    ) : (
                                      <NoContent />
                                    ))}
                                </div>
                              </>
                            )}
                          </div>
                          <FeatureFlag isFeatureEnabled={featureFlags.quickCreateOrganization}>
                            {quickCreateKeyword?.length > 0 && (
                              <div
                                className="quick-create"
                                onClick={() => {
                                  setIsPopoverOpen({ ...isPopoverOpen, organizer: false });
                                  setQuickOrganizerModal(true);
                                }}
                                data-cy="div-select-quick-create-organizer-keyword">
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
                          debounceSearchOrganizationPersonSearch(e.target.value, 'organizers');
                          setIsPopoverOpen({ ...isPopoverOpen, organizer: true });
                        }}
                        onClick={(e) => {
                          setSelectedOrganizerPerformerSupporterType(organizerPerformerSupporterTypes.organizer);
                          setQuickCreateKeyword(e.target.value);
                          setIsPopoverOpen({ ...isPopoverOpen, organizer: true });
                        }}
                        data-cy="input-quick-create-organizer-keyword"
                      />
                    </CustomPopover>
                  </KeyboardAccessibleLayout>

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
                        edit={organizer?.source === sourceOptions.CMS && true}
                        onEdit={(e) =>
                          organizerPerformerSupporterPlaceNavigationHandler(organizer?.value, organizer?.type, e)
                        }
                        creatorId={organizer?.creatorId}
                        fallbackConfig={organizer?.fallBackStatus}
                      />
                    );
                  })}
                </Form.Item>
                <QuickSelect
                  open={quickOrganizerModal}
                  setOpen={setQuickOrganizerModal}
                  setQuickCreateOrganizerModal={setQuickCreateOrganizerModal}
                  setQuickCreatePersonModal={setQuickCreatePersonModal}
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
                  selectedPerformers={selectedPerformers}
                  setSelectedPerformers={setSelectedPerformers}
                  selectedSupporters={selectedSupporters}
                  setSelectedSupporters={setSelectedSupporters}
                  selectedOrganizerPerformerSupporterType={selectedOrganizerPerformerSupporterType}
                  organizerPerformerSupporterTypes={organizerPerformerSupporterTypes}
                  saveAsDraftHandler={saveAsDraftHandler}
                  setLoaderModalOpen={setLoaderModalOpen}
                  loaderModalOpen={loaderModalOpen}
                  setShowDialog={setShowDialog}
                />
                <QuickCreatePerson
                  open={quickCreatePersonModal}
                  setOpen={setQuickCreatePersonModal}
                  calendarId={calendarId}
                  keyword={quickCreateKeyword}
                  setKeyword={setQuickCreateKeyword}
                  interfaceLanguage={user?.interfaceLanguage?.toLowerCase()}
                  calendarContentLanguage={calendarContentLanguage}
                  setSelectedOrganizers={setSelectedOrganizers}
                  selectedOrganizers={selectedOrganizers}
                  selectedPerformers={selectedPerformers}
                  setSelectedPerformers={setSelectedPerformers}
                  selectedSupporters={selectedSupporters}
                  setSelectedSupporters={setSelectedSupporters}
                  selectedOrganizerPerformerSupporterType={selectedOrganizerPerformerSupporterType}
                  organizerPerformerSupporterTypes={organizerPerformerSupporterTypes}
                  saveAsDraftHandler={saveAsDraftHandler}
                  setLoaderModalOpen={setLoaderModalOpen}
                  loaderModalOpen={loaderModalOpen}
                  setShowDialog={setShowDialog}
                />
              </Form.Item>
              <Form.Item
                label={t('dashboard.events.addEditEvent.otherInformation.contact.title')}
                className={otherInformationFieldNames.contact}
                name={otherInformationFieldNames.contact}
                style={{
                  display: !addedFields?.includes(otherInformationFieldNames.contact) && 'none',
                }}
                data-cy="form-item-event-contact-label">
                {selectedOrganizers?.length > 0 && selectedOrganizers[0]?.contact && (
                  <Outlined
                    icon={<SnippetsOutlined style={{ color: '#1B3DE6', fontSize: '20px' }} />}
                    size="large"
                    label={t('dashboard.events.addEditEvent.otherInformation.contact.copyOrganizerContact')}
                    onClick={copyOrganizerContactHandler}
                    data-cy="button-copy-organizer-contact"
                  />
                )}

                <Form.Item
                  label={t('dashboard.events.addEditEvent.otherInformation.contact.contactTitle')}
                  className="subheading-wrap"
                  data-cy="form-item-event-contact-title"
                  required={requiredFieldNames?.includes(eventFormRequiredFieldNames?.CONTACT_TITLE)}>
                  <ContentLanguageInput
                    calendarContentLanguage={calendarContentLanguage}
                    isFieldsDirty={{
                      en: form.isFieldTouched('englishContactTitle'),
                      fr: form.isFieldTouched('frenchContactTitle'),
                    }}>
                    <BilingualInput fieldData={eventData?.contactPoint?.name}>
                      <Form.Item
                        name="frenchContactTitle"
                        initialValue={eventData?.contactPoint?.name?.fr}
                        key={contentLanguage.FRENCH}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (value || getFieldValue('englishContactTitle')) {
                                return Promise.resolve();
                              } else return Promise.reject(new Error(t('common.validations.informationRequired')));
                            },
                          }),
                        ]}>
                        <TextArea
                          autoSize
                          autoComplete="off"
                          placeholder={t(
                            'dashboard.events.addEditEvent.otherInformation.contact.placeHolderContactTitleFrench',
                          )}
                          style={{
                            borderRadius: '4px',
                            border: `${
                              calendarContentLanguage === contentLanguage.BILINGUAL
                                ? '4px solid #E8E8E8'
                                : '1px solid #b6c1c9'
                            }`,
                            width: '423px',
                          }}
                          size="large"
                          data-cy="input-contact-title-french"
                        />
                      </Form.Item>
                      <Form.Item
                        name="englishContactTitle"
                        initialValue={eventData?.contactPoint?.name?.en}
                        key={contentLanguage.ENGLISH}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (value || getFieldValue('frenchContactTitle')) {
                                return Promise.resolve();
                              } else return Promise.reject(new Error(t('common.validations.informationRequired')));
                            },
                          }),
                        ]}>
                        <TextArea
                          autoSize
                          autoComplete="off"
                          placeholder={t(
                            'dashboard.events.addEditEvent.otherInformation.contact.placeHolderContactTitleEnglish',
                          )}
                          style={{
                            borderRadius: '4px',
                            border: `${
                              calendarContentLanguage === contentLanguage.BILINGUAL
                                ? '4px solid #E8E8E8'
                                : '1px solid #b6c1c9'
                            }`,
                            width: '423px',
                          }}
                          size="large"
                          data-cy="input-contact-title-english"
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
                    {
                      required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.CONTACT_WEBSITE),
                      message: t('common.validations.informationRequired'),
                    },
                  ]}
                  data-cy="form-item-event-contact-website-label">
                  <StyledInput
                    addonBefore="URL"
                    autoComplete="off"
                    placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderWebsite')}
                    data-cy="input-contact-website"
                  />
                </Form.Item>
                <Form.Item
                  name="contactPhoneNumber"
                  className="subheading-wrap"
                  label={t('dashboard.events.addEditEvent.otherInformation.contact.phoneNumber')}
                  initialValue={eventData?.contactPoint?.telephone}
                  rules={[
                    {
                      required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.PHONE_NUMBER),
                      message: t('common.validations.informationRequired'),
                    },
                  ]}
                  data-cy="form-item-event-contact-phone-number-label">
                  <StyledInput
                    placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderPhoneNumber')}
                    data-cy="input-contact-phonenumber"
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
                    {
                      required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.EMAIL),
                      message: t('common.validations.informationRequired'),
                    },
                  ]}
                  data-cy="form-item-event-contact-email-label">
                  <StyledInput
                    placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderEmail')}
                    data-cy="input-contact-email"
                  />
                </Form.Item>
              </Form.Item>

              <Form.Item
                label={t('dashboard.events.addEditEvent.otherInformation.image.mainImage')}
                name="draggerWrap"
                className="draggerWrap"
                required={requiredFieldNames?.includes(eventFormRequiredFieldNames?.IMAGE)}
                hidden={
                  standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.IMAGE)
                    ? adminCheckHandler({ calendar, user })
                      ? false
                      : true
                    : false
                }
                initialValue={mainImageData && mainImageData?.original?.uri}
                {...(isAddImageError && {
                  help: t('dashboard.events.addEditEvent.validations.errorImage'),
                  validateStatus: 'error',
                })}
                rules={[
                  ({ getFieldValue }) => ({
                    validator() {
                      if (
                        (getFieldValue('dragger') != undefined && getFieldValue('dragger')?.length > 0) ||
                        (mainImageData?.original?.uri && !getFieldValue('dragger')) ||
                        (mainImageData?.original?.uri && getFieldValue('dragger')?.length > 0)
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
                    <p className="add-event-date-heading" data-cy="para-image-upload-sub-text">
                      {t('dashboard.events.addEditEvent.otherInformation.image.subHeading')}
                    </p>
                  </Col>
                </Row>
                <ImageUpload
                  imageUrl={mainImageData?.large?.uri}
                  originalImageUrl={mainImageData?.original?.uri}
                  imageReadOnly={false}
                  preview={true}
                  setImageCropOpen={setImageCropOpen}
                  imageCropOpen={imageCropOpen}
                  form={form}
                  eventImageData={mainImageData}
                  largeAspectRatio={
                    currentCalendarData?.imageConfig?.length > 0
                      ? currentCalendarData?.imageConfig[0]?.large?.aspectRatio
                      : null
                  }
                  thumbnailAspectRatio={
                    currentCalendarData?.imageConfig?.length > 0
                      ? currentCalendarData?.imageConfig[0]?.thumbnail?.aspectRatio
                      : null
                  }
                  isCrop={featureFlags.imageCropFeature}
                />
              </Form.Item>
              <Form.Item
                name="multipleImages"
                label={t('dashboard.events.addEditEvent.otherInformation.image.additionalImages')}
                data-cy="form-item-event-multiple-image"
                hidden={!imageConfig?.enableGallery}>
                <MultipleImageUpload
                  form={form}
                  largeAspectRatio={
                    currentCalendarData?.imageConfig?.length > 0
                      ? currentCalendarData?.imageConfig[0]?.large?.aspectRatio
                      : null
                  }
                  thumbnailAspectRatio={
                    currentCalendarData?.imageConfig?.length > 0
                      ? currentCalendarData?.imageConfig[0]?.thumbnail?.aspectRatio
                      : null
                  }
                  eventImageData={eventData?.image?.filter((image) => !image?.isMain)}
                />
              </Form.Item>

              <Form.Item
                label={t('dashboard.events.addEditEvent.otherInformation.performer.title')}
                name={otherInformationFieldNames.performerWrap}
                className={otherInformationFieldNames.performerWrap}
                style={{
                  display: !addedFields?.includes(otherInformationFieldNames.performerWrap) && 'none',
                }}
                required={requiredFieldNames?.includes(eventFormRequiredFieldNames?.PERFORMER)}
                data-cy="form-item-event-performer-label">
                <Row>
                  <Col>
                    <p className="add-event-date-heading" data-cy="para-performer-subheading">
                      {t('dashboard.events.addEditEvent.otherInformation.performer.subHeading')}
                    </p>
                  </Col>
                </Row>
                <Form.Item
                  name="performers"
                  initialValue={selectedPerformers}
                  rules={[
                    () => ({
                      validator() {
                        if (requiredFieldNames?.includes(eventFormRequiredFieldNames?.PERFORMER)) {
                          if (selectedPerformers?.length > 0) {
                            return Promise.resolve();
                          } else return Promise.reject(new Error(t('common.validations.informationRequired')));
                        }
                      },
                    }),
                  ]}>
                  <KeyboardAccessibleLayout
                    setItem={(performer) => setSelectedPerformers([...selectedPerformers, performer])}
                    data={[performerList, performerImportsFootlightList, performerArtsdataList]}
                    setFieldValue={() => {
                      return;
                    }}
                    popOverHandler={() => setIsPopoverOpen({ ...isPopoverOpen, performer: false })}
                    isPopoverOpen={isPopoverOpen.performer}>
                    <CustomPopover
                      open={isPopoverOpen.performer}
                      onOpenChange={(open) => {
                        debounceSearchOrganizationPersonSearch(quickCreateKeyword, 'performers');
                        setIsPopoverOpen({ ...isPopoverOpen, performer: open });
                      }}
                      overlayClassName="event-popover"
                      placement="bottom"
                      autoAdjustOverflow={false}
                      destroyTooltipOnHide={true}
                      trigger={['click']}
                      getPopupContainer={(trigger) => trigger.parentNode}
                      data-cy="popover-performer"
                      content={
                        <div>
                          <>
                            <div className="popover-section-header" data-cy="performer-footlight-entity-heading">
                              {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                            </div>
                            <div className="search-scrollable-content">
                              {isEntitiesFetching && (
                                <div
                                  style={{
                                    height: '200px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                  <LoadingIndicator />
                                </div>
                              )}
                              {!isEntitiesFetching &&
                                (performerList?.length > 0 ? (
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
                                      }}
                                      data-cy={`div-select-performer-${index}`}>
                                      {performer?.label}
                                    </div>
                                  ))
                                ) : (
                                  <NoContent />
                                ))}
                            </div>
                          </>
                          {quickCreateKeyword !== '' && (
                            <>
                              <div className="popover-section-header" data-cy="performer-artsdata-entity-heading">
                                {t('dashboard.organization.createNew.search.importsFromFootlight')}
                              </div>
                              <div className="search-scrollable-content">
                                {isExternalSourceFetching && (
                                  <div
                                    style={{
                                      height: '200px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    <LoadingIndicator />
                                  </div>
                                )}
                                {!isExternalSourceFetching &&
                                  (performerImportsFootlightList?.length > 0 ? (
                                    performerImportsFootlightList?.map((performer, index) => (
                                      <div
                                        key={index}
                                        className="event-popover-options"
                                        onClick={() => {
                                          setSelectedPerformers([...selectedPerformers, performer]);
                                          setIsPopoverOpen({
                                            ...isPopoverOpen,
                                            performer: false,
                                          });
                                        }}
                                        data-cy={`div-select-import-footlight-performer-${index}`}>
                                        {performer?.label}
                                      </div>
                                    ))
                                  ) : (
                                    <NoContent />
                                  ))}
                              </div>
                            </>
                          )}
                          {quickCreateKeyword !== '' && (
                            <>
                              <div className="popover-section-header" data-cy="performer-artsdata-entity-heading">
                                {t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                              </div>
                              <div className="search-scrollable-content">
                                {isExternalSourceFetching && (
                                  <div
                                    style={{
                                      height: '200px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    <LoadingIndicator />
                                  </div>
                                )}
                                {!isExternalSourceFetching &&
                                  (performerArtsdataList?.length > 0 ? (
                                    performerArtsdataList?.map((performer, index) => (
                                      <div
                                        key={index}
                                        className="event-popover-options"
                                        onClick={() => {
                                          setSelectedPerformers([...selectedPerformers, performer]);
                                          setIsPopoverOpen({
                                            ...isPopoverOpen,
                                            performer: false,
                                          });
                                        }}
                                        data-cy={`div-select-artsdata-performer-${index}`}>
                                        {performer?.label}
                                      </div>
                                    ))
                                  ) : (
                                    <NoContent />
                                  ))}
                              </div>
                            </>
                          )}

                          <FeatureFlag isFeatureEnabled={featureFlags.quickCreateOrganization}>
                            {quickCreateKeyword?.length > 0 && (
                              <div
                                className="quick-create"
                                onClick={() => {
                                  setIsPopoverOpen({ ...isPopoverOpen, performer: false });
                                  setQuickOrganizerModal(true);
                                }}
                                data-cy="div-select-quick-create-performer-keyword">
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
                          debounceSearchOrganizationPersonSearch(e.target.value, 'performers');
                          setIsPopoverOpen({ ...isPopoverOpen, performer: true });
                          setQuickCreateKeyword(e.target.value);
                        }}
                        onClick={(e) => {
                          setSelectedOrganizerPerformerSupporterType(organizerPerformerSupporterTypes.performer);
                          setQuickCreateKeyword(e.target.value);
                          setIsPopoverOpen({ ...isPopoverOpen, performer: true });
                        }}
                        data-cy="input-quick-create-performer-keyword"
                      />
                    </CustomPopover>
                  </KeyboardAccessibleLayout>
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
                        edit={performer?.source === sourceOptions.CMS && true}
                        onEdit={(e) =>
                          organizerPerformerSupporterPlaceNavigationHandler(performer?.value, performer?.type, e)
                        }
                        creatorId={performer?.creatorId}
                        fallbackConfig={performer?.fallBackStatus}
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
                }}
                required={requiredFieldNames?.includes(eventFormRequiredFieldNames?.COLLABORATOR)}
                data-cy="form-item-supporter-label">
                <Row>
                  <Col>
                    <p className="add-event-date-heading" data-cy="para-supporter-subheading">
                      {t('dashboard.events.addEditEvent.otherInformation.supporter.subHeading')}
                    </p>
                  </Col>
                </Row>
                <Form.Item
                  name="supporters"
                  initialValue={selectedSupporters}
                  rules={[
                    () => ({
                      validator() {
                        if (requiredFieldNames?.includes(eventFormRequiredFieldNames?.COLLABORATOR)) {
                          if (selectedSupporters?.length > 0) {
                            return Promise.resolve();
                          } else return Promise.reject(new Error(t('common.validations.informationRequired')));
                        }
                      },
                    }),
                  ]}>
                  <KeyboardAccessibleLayout
                    setItem={(supporter) => setSelectedSupporters([...selectedSupporters, supporter])}
                    data={[supporterList, supporterImportsFootlightList, supporterArtsdataList]}
                    setFieldValue={() => {
                      return;
                    }}
                    popOverHandler={() => setIsPopoverOpen({ ...isPopoverOpen, supporter: false })}
                    isPopoverOpen={isPopoverOpen.supporter}>
                    <CustomPopover
                      open={isPopoverOpen.supporter}
                      onOpenChange={(open) => {
                        debounceSearchOrganizationPersonSearch(quickCreateKeyword, 'supporters');
                        setIsPopoverOpen({ ...isPopoverOpen, supporter: open });
                      }}
                      overlayClassName="event-popover"
                      placement="bottom"
                      autoAdjustOverflow={false}
                      destroyTooltipOnHide={true}
                      trigger={['click']}
                      getPopupContainer={(trigger) => trigger.parentNode}
                      data-cy="popover-supporter"
                      content={
                        <div>
                          <div>
                            <>
                              <div className="popover-section-header" data-cy="supporter-footlight-entity-heading">
                                {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                              </div>
                              <div className="search-scrollable-content">
                                {isEntitiesFetching && (
                                  <div
                                    style={{
                                      height: '200px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    <LoadingIndicator />
                                  </div>
                                )}
                                {!isEntitiesFetching &&
                                  (supporterList?.length > 0 ? (
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
                                        }}
                                        data-cy={`div-select-supporter-${index}`}>
                                        {supporter?.label}
                                      </div>
                                    ))
                                  ) : (
                                    <NoContent />
                                  ))}
                              </div>
                            </>
                            {quickCreateKeyword !== '' && (
                              <>
                                <div className="popover-section-header" data-cy="supporter-artsdata-entity-heading">
                                  {t('dashboard.organization.createNew.search.importsFromFootlight')}
                                </div>
                                <div className="search-scrollable-content">
                                  {isExternalSourceFetching && (
                                    <div
                                      style={{
                                        height: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                      <LoadingIndicator />
                                    </div>
                                  )}
                                  {!isExternalSourceFetching &&
                                    (supporterImportsFootlightList?.length > 0 ? (
                                      supporterImportsFootlightList?.map((supporter, index) => (
                                        <div
                                          key={index}
                                          className="event-popover-options"
                                          onClick={() => {
                                            setSelectedSupporters([...selectedSupporters, supporter]);
                                            setIsPopoverOpen({
                                              ...isPopoverOpen,
                                              supporter: false,
                                            });
                                          }}
                                          data-cy={`div-select-import-footlight-supporter-${index}`}>
                                          {supporter?.label}
                                        </div>
                                      ))
                                    ) : (
                                      <NoContent />
                                    ))}
                                </div>
                              </>
                            )}
                            {quickCreateKeyword !== '' && (
                              <>
                                <div className="popover-section-header" data-cy="supporter-artsdata-entity-heading">
                                  {t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                                </div>
                                <div className="search-scrollable-content">
                                  {isExternalSourceFetching && (
                                    <div
                                      style={{
                                        height: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                      <LoadingIndicator />
                                    </div>
                                  )}
                                  {!isExternalSourceFetching &&
                                    (supporterArtsdataList?.length > 0 ? (
                                      supporterArtsdataList?.map((supporter, index) => (
                                        <div
                                          key={index}
                                          className="event-popover-options"
                                          onClick={() => {
                                            setSelectedSupporters([...selectedSupporters, supporter]);
                                            setIsPopoverOpen({
                                              ...isPopoverOpen,
                                              supporter: false,
                                            });
                                          }}
                                          data-cy={`div-select-artsdata-supporter-${index}`}>
                                          {supporter?.label}
                                        </div>
                                      ))
                                    ) : (
                                      <NoContent />
                                    ))}
                                </div>
                              </>
                            )}
                          </div>
                          <FeatureFlag isFeatureEnabled={featureFlags.quickCreateOrganization}>
                            {quickCreateKeyword?.length > 0 && (
                              <div
                                className="quick-create"
                                onClick={() => {
                                  setIsPopoverOpen({ ...isPopoverOpen, supporter: false });
                                  setQuickOrganizerModal(true);
                                }}
                                data-cy="div-quick-create-keyword-supporter">
                                <PlusCircleOutlined data-cy="div-select-quick-create-supporter-keyword" />
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
                          debounceSearchOrganizationPersonSearch(e.target.value, 'supporters');
                          setIsPopoverOpen({ ...isPopoverOpen, supporter: true });
                          setQuickCreateKeyword(e.target.value);
                        }}
                        onClick={(e) => {
                          setSelectedOrganizerPerformerSupporterType(organizerPerformerSupporterTypes.supporter);
                          setQuickCreateKeyword(e.target.value);
                          setIsPopoverOpen({ ...isPopoverOpen, supporter: true });
                        }}
                        data-cy="input-quick-create-supporter-keyword"
                      />
                    </CustomPopover>
                  </KeyboardAccessibleLayout>

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
                        edit={supporter?.source === sourceOptions.CMS && true}
                        onEdit={(e) =>
                          organizerPerformerSupporterPlaceNavigationHandler(supporter?.value, supporter?.type, e)
                        }
                        creatorId={supporter?.creatorId}
                        fallbackConfig={supporter?.fallBackStatus}
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
                  {
                    required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.EVENT_LINK),
                    message: t('common.validations.informationRequired'),
                  },
                ]}
                data-cy="form-item-event-link">
                <StyledInput
                  addonBefore="URL"
                  autoComplete="off"
                  placeholder={t('dashboard.events.addEditEvent.otherInformation.placeHolderLinks')}
                  data-cy="input-event-link"
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
                  { validator: (rule, value) => validateVideoLink(rule, value) },

                  {
                    required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.VIDEO_URL),
                    message: t('common.validations.informationRequired'),
                  },
                ]}
                data-cy="form-item-video-link">
                <StyledInput
                  addonBefore="URL"
                  autoComplete="off"
                  placeholder={t('dashboard.events.addEditEvent.otherInformation.placeHolderLinks')}
                  data-cy="input-video-link"
                />
              </Form.Item>
              {getEmbedUrl(form.getFieldValue(otherInformationFieldNames.videoLink)) !== '' && (
                <Row>
                  <Col span={24}>
                    <iframe
                      className="iframe-video-embed"
                      width="100%"
                      height="315"
                      src={getEmbedUrl(form.getFieldValue(otherInformationFieldNames.videoLink))}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowfullscreen></iframe>
                  </Col>
                </Row>
              )}

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
                    {
                      required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.FACEBOOK_URL),
                      message: t('common.validations.informationRequired'),
                    },
                  ]}
                  data-cy="form-item-facebook-link">
                  <StyledInput
                    addonBefore="URL"
                    autoComplete="off"
                    placeholder={t('dashboard.events.addEditEvent.otherInformation.placeHolderLinks')}
                    data-cy="input-facebook-link"
                  />
                </Form.Item>
                <p className="add-event-date-heading" data-cy="para-facebook-link-footer">
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
                initialValue={eventData?.keywords}
                rules={[
                  {
                    required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.KEYWORDS),
                    message: t('common.validations.informationRequired'),
                  },
                ]}
                data-cy="form-item-select-keywords-label">
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
                        closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}
                        data-cy={`tag-select-keywords-${label}`}>
                        {label}
                      </Tags>
                    );
                  }}
                  data-cy="select-keywords"
                />
              </Form.Item>
              <Form.Item
                name={otherInformationFieldNames.inLanguage}
                className={otherInformationFieldNames.inLanguage}
                style={{
                  display:
                    (!addedFields?.includes(otherInformationFieldNames.inLanguage) ||
                      !taxonomyDetails(allTaxonomyData?.data, user, 'inLanguage', 'name', false)) &&
                    'none',
                }}
                label={taxonomyDetails(allTaxonomyData?.data, user, 'inLanguage', 'name', false)}
                initialValue={eventData?.inLanguage?.map((inLanguage) => {
                  return inLanguage?.entityId;
                })}
                data-cy="form-item-eventlanguage-label">
                <TreeSelectOption
                  allowClear
                  treeDefaultExpandAll
                  placeholder={t('dashboard.events.addEditEvent.otherInformation.eventLanguagePlaceholder')}
                  notFoundContent={<NoContent />}
                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                  treeData={treeTaxonomyOptions(allTaxonomyData, user, 'inLanguage', false, calendarContentLanguage)}
                  data-cy="treeselect-event-language"
                  tagRender={(props) => {
                    const { closable, onClose, label } = props;
                    return (
                      <Tags
                        data-cy={`tag-event-language-${label}`}
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
            <ChangeTypeLayout>
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
            </ChangeTypeLayout>
          </CardEvent>
          {taxonomyDetails(allTaxonomyData?.data, user, 'EventAccessibility', 'name', false) && (
            <CardEvent
              title={t('dashboard.events.addEditEvent.eventAccessibility.title')}
              marginResponsive="0px"
              hidden={
                standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.EVENT_ACCESSIBILITY)
                  ? adminCheckHandler({ calendar, user })
                    ? false
                    : true
                  : false
              }>
              <>
                <p className="add-event-date-heading" data-cy="event-accessibility-subheading">
                  {t('dashboard.events.addEditEvent.eventAccessibility.subHeading')}
                </p>
                <Form.Item
                  name="eventAccessibility"
                  className="eventAccessibility"
                  label={taxonomyDetails(allTaxonomyData?.data, user, 'EventAccessibility', 'name', false)}
                  initialValue={eventData?.accessibility?.map((type) => {
                    return type?.entityId;
                  })}
                  style={{
                    display:
                      !taxonomyDetails(allTaxonomyData?.data, user, 'EventAccessibility', 'name', false) && 'none',
                  }}
                  rules={[
                    {
                      required: requiredFieldNames?.includes(eventFormRequiredFieldNames?.EVENT_ACCESSIBILITY),
                      message: t('common.validations.informationRequired'),
                    },
                  ]}
                  hidden={
                    standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.EVENT_ACCESSIBILITY)
                      ? adminCheckHandler({ calendar, user })
                        ? false
                        : true
                      : false
                  }
                  extra={
                    <p
                      className="add-event-date-heading"
                      style={{ fontSize: '12px' }}
                      data-cy="para-event-accessibility-footer">
                      {t('dashboard.events.addEditEvent.eventAccessibility.footer')}
                    </p>
                  }
                  data-cy="form-item-event-accessibility-label">
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
                    data-cy="treeselect-event-accessibility"
                    tagRender={(props) => {
                      const { label, closable, onClose } = props;
                      return (
                        <Tags
                          data-cy={`tag-event-accessibility-${label}`}
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
                  }}
                  data-cy="form-item-accessiblity-note-label">
                  <ContentLanguageInput
                    calendarContentLanguage={calendarContentLanguage}
                    isFieldsDirty={{
                      en: form.isFieldTouched('englishAccessibilityNote'),
                      fr: form.isFieldTouched('frenchAccessibilityNote'),
                    }}>
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
                            border: `${
                              calendarContentLanguage === contentLanguage.BILINGUAL
                                ? '4px solid #E8E8E8'
                                : '1px solid #b6c1c9'
                            }`,
                            width: '423px',
                            resize: 'vertical',
                          }}
                          size="large"
                          data-cy="text-area-accessibility-note-french"
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
                            border: `${
                              calendarContentLanguage === contentLanguage.BILINGUAL
                                ? '4px solid #E8E8E8'
                                : '1px solid #b6c1c9'
                            }`,
                            width: '423px',
                            resize: 'vertical',
                          }}
                          size="large"
                          data-cy="text-area-accessibility-note-english"
                        />
                      </Form.Item>
                    </BilingualInput>
                  </ContentLanguageInput>
                </Form.Item>
              </>
              <ChangeTypeLayout>
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
              </ChangeTypeLayout>
            </CardEvent>
          )}
          <CardEvent
            marginResponsive="0px"
            title={t('dashboard.events.addEditEvent.tickets.title')}
            required={requiredFieldNames?.includes(eventFormRequiredFieldNames?.TICKET_INFO)}
            hidden={
              standardAdminOnlyFields?.includes(eventFormRequiredFieldNames?.TICKET_INFO)
                ? adminCheckHandler({ calendar, user })
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
                          onClick={() => {
                            setTicketType(offerTypes.FREE);
                            setShowDialog(true);
                          }}
                          data-cy="button-select-ticket-free"
                        />
                        <DateAction
                          iconrender={<Money />}
                          label={t('dashboard.events.addEditEvent.tickets.paid')}
                          onClick={() => setTicketType(offerTypes.PAYING)}
                          data-cy="button-select-ticket-paid"
                        />
                        <DateAction
                          iconrender={<EditOutlined />}
                          label={t('dashboard.events.addEditEvent.tickets.registration')}
                          onClick={() => setTicketType(offerTypes.REGISTER)}
                          data-cy="button-select-ticket-register"
                        />
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              )}
              {ticketType == offerTypes.REGISTER && (
                <Form.Item label={t('dashboard.events.addEditEvent.tickets.registerLink')}>
                  <Input.Group compact>
                    <Form.Item
                      name="ticketLinkType"
                      noStyle
                      initialValue={
                        eventData?.offerConfiguration?.email ? ticketLinkOptions[1].value : ticketLinkOptions[0].value
                      }
                      rules={[{ required: true, message: 'Province is required' }]}>
                      <Select
                        className="ticket-link-select"
                        style={{ width: '30%' }}
                        placeholder="Select province"
                        options={ticketLinkOptions}
                        onChange={() => form.setFieldValue('registerLink', null)}
                      />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      name="registerLink"
                      initialValue={eventData?.offerConfiguration?.url?.uri ?? eventData?.offerConfiguration?.email}
                      rules={[
                        form.getFieldValue('ticketLinkType') == ticketLinkOptions[0].value && {
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
                        form.getFieldValue('ticketLinkType') == ticketLinkOptions[1].value && {
                          type: 'email',
                          message: t('login.validations.invalidEmail'),
                        },
                      ]}
                      data-cy="form-item-register-link-label">
                      <StyledInput
                        style={{ width: '70%' }}
                        autoComplete="off"
                        placeholder={
                          form.getFieldValue('ticketLinkType') == ticketLinkOptions[1].value
                            ? t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderEmail')
                            : t('dashboard.events.addEditEvent.tickets.placeHolderLinks')
                        }
                        data-cy="input-ticket-registration-link"
                      />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              )}
              {ticketType == offerTypes.PAYING && (
                <>
                  <Form.Item label={t('dashboard.events.addEditEvent.tickets.buyTicketLink')}>
                    <Input.Group compact>
                      <Form.Item
                        name="ticketLinkType"
                        noStyle
                        initialValue={
                          eventData?.offerConfiguration?.email ? ticketLinkOptions[1].value : ticketLinkOptions[0].value
                        }>
                        <Select
                          className="ticket-link-select"
                          style={{ width: '30%', backgroundColor: '#F7F7F7' }}
                          options={ticketLinkOptions}
                          onChange={() => form.setFieldValue('ticketLink', null)}
                          data-cy="select-url-status"
                        />
                      </Form.Item>

                      <Form.Item
                        noStyle
                        name="ticketLink"
                        data-cy="form-item-ticket-link-label"
                        initialValue={eventData?.offerConfiguration?.url?.uri ?? eventData?.offerConfiguration?.email}
                        rules={[
                          form.getFieldValue('ticketLinkType') == ticketLinkOptions[0].value && {
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
                          form.getFieldValue('ticketLinkType') == ticketLinkOptions[1].value && {
                            type: 'email',
                            message: t('login.validations.invalidEmail'),
                          },
                        ]}>
                        <StyledInput
                          style={{ width: '70%' }}
                          autoComplete="off"
                          placeholder={
                            form.getFieldValue('ticketLinkType') == ticketLinkOptions[1].value
                              ? t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderEmail')
                              : t('dashboard.events.addEditEvent.tickets.placeHolderLinks')
                          }
                          data-cy="input-ticket-buy-link"
                        />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>

                  <ContentLanguageInput
                    calendarContentLanguage={calendarContentLanguage}
                    isFieldsDirty={{ en: form.isFieldTouched('prices'), fr: form.isFieldTouched('prices') }}>
                    <BilingualInput>
                      <Form.List
                        name="prices"
                        initialValue={eventData?.offerConfiguration?.prices ?? [undefined]}
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
                            form={form}
                            firstFieldName={'price'}
                            secondFieldName={'name'}
                            thirdFieldName={'fr'}
                          />
                        )}
                      </Form.List>
                      <Form.List
                        name="prices"
                        initialValue={eventData?.offerConfiguration?.prices ?? [undefined]}
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
                            form={form}
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
                  <ContentLanguageInput
                    calendarContentLanguage={calendarContentLanguage}
                    isFieldsDirty={{
                      en: form.isFieldTouched('englishTicketNote'),
                      fr: form.isFieldTouched('frenchTicketNote'),
                    }}>
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
                            border: `${
                              calendarContentLanguage === contentLanguage.BILINGUAL
                                ? '4px solid #E8E8E8'
                                : '1px solid #b6c1c9'
                            }`,
                            width: '423px',
                            resize: 'vertical',
                          }}
                          size="large"
                          data-cy="input-ticket-price-note-french"
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
                            border: `${
                              calendarContentLanguage === contentLanguage.BILINGUAL
                                ? '4px solid #E8E8E8'
                                : '1px solid #b6c1c9'
                            }`,
                            width: '423px',
                            resize: 'vertical',
                          }}
                          size="large"
                          data-cy="input-ticket-price-note-english"
                        />
                      </Form.Item>
                    </BilingualInput>
                  </ContentLanguageInput>
                </Form.Item>
              )}
            </>
            {ticketType && (ticketType == offerTypes.PAYING || ticketType == offerTypes.REGISTER) && (
              <ChangeTypeLayout>
                <Form.Item
                  label={t('dashboard.events.addEditEvent.tickets.changeTicketType')}
                  data-cy="form-item-change-ticket-type-label"
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
              </ChangeTypeLayout>
            )}
          </CardEvent>
        </Row>
      </Form>
    </div>
  ) : (
    <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingIndicator />
    </div>
  );
}

export default AddEvent;
