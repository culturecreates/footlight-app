import React, { useCallback, useEffect, useRef, useState } from 'react';
import CustomModal from '../Common/CustomModal';
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import TextButton from '../../Button/Text/Text';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../Button/Primary/Primary';
import { Row, Col, Form, notification, message, Button } from 'antd';
import { useAddImageMutation } from '../../../services/image';
import { useAddOrganizationMutation, useLazyGetOrganizationQuery } from '../../../services/organization';
import './quickCreateOrganization.css';
import { treeDynamicTaxonomyOptions, treeEntitiesOption } from '../../TreeSelectOption/treeSelectOption.settings';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { entitiesClass } from '../../../constants/entitiesClass';
import { externalSourceOptions, sourceOptions } from '../../../constants/sourceOptions';
import Outlined from '../../Button/Outlined';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import QuickCreateSaving from '../QuickCreateSaving/QuickCreateSaving';
import { eventPublishState } from '../../../constants/eventPublishState';
import { createInitialNamesObjectFromKeyword } from '../../../utils/MultiLingualFormItemSupportFunctions';
import { contentLanguageKeyMap } from '../../../constants/contentLanguage';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import {
  checkMandatoryAdminOnlyFields,
  formCategory,
  formFieldValue,
  returnFormDataWithFields,
} from '../../../constants/formFields';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { formFieldsHandler } from '../../../utils/formFieldsHandler';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { bilingual } from '../../../utils/bilingual';
import SortableTreeSelect from '../../TreeSelectOption/SortableTreeSelect';
import NoContent from '../../NoContent/NoContent';
import { formPayloadHandler } from '../../../utils/formPayloadHandler';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { useLazyGetEntitiesQuery } from '../../../services/entities';
import { useLazyGetExternalSourceQuery } from '../../../services/externalSource';
import { placesOptions } from '../../Select/selectOption.settings';
import { uploadImageListHelper } from '../../../utils/uploadImageListHelper';

function QuickCreateOrganization(props) {
  const {
    // eslint-disable-next-line no-unused-vars
    open,
    setOpen,
    calendarContentLanguage,
    calendarId,
    keyword,
    setKeyword,
    selectedOrganizers,
    setSelectedOrganizers,
    selectedPerformers,
    setSelectedPerformers,
    selectedSupporters,
    setSelectedSupporters,
    eventForm,
    selectedOrganizerPerformerSupporterType,
    organizerPerformerSupporterTypes,
    saveAsDraftHandler,
    setLoaderModalOpen,
    loaderModalOpen,
    setShowDialog,
  } = props;
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector(getUserDetails);
  const { eventId } = useParams();
  const timestampRef = useRef(Date.now()).current;

  const [addImage] = useAddImageMutation();
  const [addOrganization] = useAddOrganizationMutation();
  const [getOrganization] = useLazyGetOrganizationQuery();

  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
  ] = useOutletContext();

  const [event, setEvent] = useState([]);
  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.ORGANIZATION);
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
  });

  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery();
  const [getExternalSource, { isFetching: isExternalSourceFetching }] = useLazyGetExternalSourceQuery();

  const [imageCropOpen, setImageCropOpen] = useState(false);
  const [locationPlace, setLocationPlace] = useState();
  const [allPlacesList, setAllPlacesList] = useState([]);
  const [allPlacesArtsdataList, setAllPlacesArtsdataList] = useState([]);
  const [allPlacesImportsFootlight, setAllPlacesImportsFootlight] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  let fields = formFieldsHandler(currentCalendarData?.forms, entitiesClass.organization);
  let formFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.organization);
  let formFieldProperties = formFields?.length > 0 && formFields[0]?.formFieldProperties;
  fields = fields
    ?.filter((category) => category.length > 0)
    ?.map((category) =>
      category.filter(
        (field) =>
          checkMandatoryAdminOnlyFields(field?.name, formFieldProperties?.mandatoryFields?.standardFields) ||
          checkMandatoryAdminOnlyFields(field?.name, formFieldProperties?.minimumRequiredFields?.standardFields),
      ),
    );
  formFields = formFields?.length > 0 && formFields[0]?.formFields;
  let organizationData = {
    name: createInitialNamesObjectFromKeyword(keyword, calendarContentLanguage),
  };

  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  useEffect(() => {
    if (event.length > 0) {
      saveAsDraftHandler(event[0], true, eventPublishState.DRAFT)
        .then((res) => {
          setLoaderModalOpen(false);
          if (res) {
            notification.success({
              description: t('dashboard.events.addEditEvent.notification.updateEvent'),
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
            navigate(
              `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}?id=${event[1]?.id}`,
              {
                state: {
                  data: { isRoutingToEventPage: eventId ? location.pathname : `${location.pathname}/${res}` },
                },
              },
            );
          }
        })
        .catch((error) => {
          if (error) {
            setLoaderModalOpen(false);
          }
        });
    }
  }, [selectedOrganizers, selectedPerformers, selectedSupporters]);

  const getSelectedOrganizer = (id) => {
    getOrganization({ id, calendarId })
      .unwrap()
      .then((response) => {
        let createdOrganizer = [
          {
            disambiguatingDescription: response?.disambiguatingDescription,
            id: response?.id,
            name: response?.name,
            type: entitiesClass.organization,
            logo: response?.logo,
          },
        ];
        createdOrganizer = treeEntitiesOption(createdOrganizer, user, calendarContentLanguage, sourceOptions.CMS);
        if (createdOrganizer?.length === 1) {
          switch (selectedOrganizerPerformerSupporterType) {
            case organizerPerformerSupporterTypes.organizer:
              setSelectedOrganizers([...selectedOrganizers, createdOrganizer[0]]);
              break;
            case organizerPerformerSupporterTypes.performer:
              setSelectedPerformers([...selectedPerformers, createdOrganizer[0]]);
              break;
            case organizerPerformerSupporterTypes.supporter:
              setSelectedSupporters([...selectedSupporters, createdOrganizer[0]]);
              break;

            default:
              break;
          }
        }
      })
      .catch((error) => console.log(error));
  };

  const placesSearch = (inputValue = '') => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.place);
    let sourceQuery = new URLSearchParams();
    sourceQuery.append('sources', externalSourceOptions.ARTSDATA);
    sourceQuery.append('sources', externalSourceOptions.FOOTLIGHT);
    getEntities({
      searchKey: inputValue,
      classes: decodeURIComponent(query.toString()),
      calendarId,
    })
      .unwrap()
      .then((response) => {
        setAllPlacesList(placesOptions(response, user, calendarContentLanguage, sourceOptions.CMS));
      })
      .catch((error) => console.log(error));
    getExternalSource({
      searchKey: inputValue,
      classes: decodeURIComponent(query.toString()),
      sources: decodeURIComponent(sourceQuery.toString()),
      calendarId,
      excludeExistingCMS: true,
    })
      .unwrap()
      .then((response) => {
        setAllPlacesArtsdataList(
          placesOptions(response?.artsdata, user, calendarContentLanguage, sourceOptions.ARTSDATA),
        );
        setAllPlacesImportsFootlight(
          placesOptions(response?.footlight, user, calendarContentLanguage, externalSourceOptions.FOOTLIGHT),
        );
      })
      .catch((error) => console.log(error));
  };

  const debounceSearchPlace = useCallback(useDebounce(placesSearch, SEARCH_DELAY), []);

  const createOrganizationHandler = (toggle = true) => {
    let validationFieldNames = [];
    calendarContentLanguage.forEach((language) => {
      validationFieldNames.push(['name', contentLanguageKeyMap[language]]);
    });
    validationFieldNames = validationFieldNames.concat(
      fields?.map((category) => category?.map((field) => field.mappedField))?.flat() ?? [],
    );
    return new Promise((resolve, reject) => {
      form
        .validateFields(validationFieldNames)
        .then(async () => {
          var values = form.getFieldsValue(true);
          let organizationPayload = {};
          Object.keys(values)?.map((object) => {
            let payload = formPayloadHandler(values[object], object, formFields, calendarContentLanguage);
            if (payload) {
              let newKeys = Object.keys(payload);
              let childKeys = object?.split('.');
              organizationPayload = {
                ...organizationPayload,
                ...(newKeys?.length > 0 && { [newKeys[0]]: payload[newKeys[0]] }),
                ...(childKeys?.length == 2 && {
                  [childKeys[0]]: {
                    ...organizationPayload[childKeys[0]],
                    [childKeys[1]]: payload[childKeys[0]][childKeys[1]],
                  },
                }),
              };
            }
          });

          if (locationPlace?.source === sourceOptions.ARTSDATA) {
            organizationPayload = {
              ...organizationPayload,
              place: {
                uri: locationPlace?.uri,
              },
            };
          } else {
            organizationPayload = {
              ...organizationPayload,
              place: {
                entityId: locationPlace?.value,
              },
            };
          }

          let imageCrop = form.getFieldValue('imageCrop') ? [form.getFieldValue('imageCrop')] : [];
          let mainImageOptions = form.getFieldValue('mainImageOptions');
          if (imageCrop.length > 0) {
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
                description: mainImageOptions?.altText,
                creditText: mainImageOptions?.credit,
                caption: mainImageOptions?.caption,
              },
            ];
          }

          try {
            if (values?.image?.length > 0 && values?.image[0]?.originFileObj) {
              const formdata = new FormData();
              formdata.append('file', values?.image[0].originFileObj);
              const mainImageResponse = await addImage({ data: formdata, calendarId }).unwrap();
              imageCrop = [
                {
                  large: imageCrop[0]?.large,
                  thumbnail: imageCrop[0]?.thumbnail,
                  isMain: true,
                  original: {
                    entityId: mainImageResponse?.data?.original?.entityId,
                    height: mainImageResponse?.data?.height,
                    width: mainImageResponse?.data?.width,
                  },
                  description: mainImageOptions?.altText,
                  creditText: mainImageOptions?.credit,
                  caption: mainImageOptions?.caption,
                },
              ];
            }
            if (values.multipleImagesCrop?.length > 0)
              await uploadImageListHelper(values, addImage, calendarId, imageCrop);

            organizationPayload['image'] = imageCrop ?? [];

            if (values?.logo?.length > 0 && values?.logo[0]?.originFileObj) {
              const formdata = new FormData();
              formdata.append('file', values?.logo[0].originFileObj);
              const logoImageResponse = await addImage({ data: formdata, calendarId }).unwrap();

              organizationPayload['logo'] = {
                original: {
                  entityId: logoImageResponse?.data?.original?.entityId,
                  height: logoImageResponse?.data?.height,
                  width: logoImageResponse?.data?.width,
                },
                large: {},
                thumbnail: {},
              };
            }

            if (!toggle) {
              setLoaderModalOpen(true);
              setOpen(false);
            }
            const organizationResponse = await addOrganization({ data: organizationPayload, calendarId }).unwrap();

            if (toggle) {
              notification.success({
                description: t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.success'),
                placement: 'top',
                closeIcon: <></>,
                maxCount: 1,
                duration: 3,
              });
              setKeyword('');
              getSelectedOrganizer(organizationResponse?.id);
              setOpen(false);
            } else {
              getSelectedOrganizer(organizationResponse?.id);
              setOpen(false);
            }

            setShowDialog(true);
            resolve(organizationResponse);
          } catch (error) {
            console.error(error);
            reject(error);
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  };

  const goToAddFullDetailsPageHandler = async (e) => {
    eventForm
      .validateFields([
        ...new Set([
          ...(calendarContentLanguage.map((language) => ['name', `${contentLanguageKeyMap[language]}`]) ?? []),
          'datePicker',
          'dateRangePicker',
          'datePickerWrapper',
          'startDateRecur',
        ]),
      ])
      .then(async () => {
        const response = await createOrganizationHandler(false);
        if (response) {
          setEvent([e, response]);
        }
      })
      .catch((error) => {
        console.error(error);
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
  };

  return (
    <>
      {!loaderModalOpen && !taxonomyLoading ? (
        <CustomModal
          open={open}
          centered
          title={
            <span className="quick-create-organization-modal-title" data-cy="span-quick-create-organization-heading">
              {t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.title')}
            </span>
          }
          bodyStyle={{
            maxHeight: '60vh',
            minHeight: '10vh',
            overflowY: 'auto',
          }}
          onCancel={() => setOpen(false)}
          footer={
            <div
              style={{ display: 'flex', justifyContent: 'space-between' }}
              className="quick-create-organization-modal-footer">
              <div className="add-full-details-btn-wrapper" key="add-full-details">
                <Outlined
                  size="large"
                  label={t('dashboard.events.addEditEvent.quickCreate.addFullDetails')}
                  data-cy="button-quick-create-organization-add-full-details"
                  onClick={(e) => {
                    goToAddFullDetailsPageHandler(e);
                  }}
                />
              </div>
              <div>
                <TextButton
                  key="cancel"
                  size="large"
                  label={t('dashboard.events.addEditEvent.quickCreate.cancel')}
                  onClick={() => setOpen(false)}
                  data-cy="button-quick-create-organization-cancel"
                />
                <PrimaryButton
                  key="add-dates"
                  label={t('dashboard.events.addEditEvent.quickCreate.create')}
                  onClick={createOrganizationHandler}
                  data-cy="button-quick-create-organization-save"
                />
              </div>
            </div>
          }>
          <Row gutter={[0, 10]} className="quick-create-organization-modal-wrapper">
            <Col span={24}>
              <Form form={form} layout="vertical" name="organizerForm" preserve={false}>
                <Row>
                  <Col>
                    <p
                      className="quick-create-organization-modal-sub-heading"
                      data-cy="para-quick-create-organization-subheading">
                      {t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.subHeading')}
                    </p>
                  </Col>
                </Row>
                {fields?.map((section) => {
                  if (section?.length > 0)
                    return (
                      <>
                        {section?.map((field) => {
                          return formFieldValue?.map((formField, index) => {
                            if (formField?.type === field.type) {
                              return returnFormDataWithFields({
                                field,
                                formField,
                                allTaxonomyData,
                                user,
                                calendarContentLanguage,
                                entityData: organizationData,
                                index,
                                t,
                                adminCheck: adminCheckHandler({ calendar, user }),
                                currentCalendarData,
                                imageCropOpen,
                                setImageCropOpen,
                                placesSearch: debounceSearchPlace,
                                allPlacesList,
                                allPlacesArtsdataList,
                                allPlacesImportsFootlight,
                                locationPlace,
                                setLocationPlace,
                                setIsPopoverOpen,
                                isPopoverOpen,
                                form,
                                // placeNavigationHandler,
                                isEntitiesFetching,
                                isExternalSourceFetching,
                                mandatoryFields: formFieldProperties?.mandatoryFields?.standardFields ?? [],
                                adminOnlyFields: formFieldProperties?.adminOnlyFields?.standardFields ?? [],
                                setShowDialog,
                              });
                            }
                          });
                        })}
                        {section[0]?.category === formCategory.PRIMARY &&
                          allTaxonomyData?.data?.map((taxonomy, index) => {
                            if (
                              taxonomy?.isDynamicField &&
                              formFieldProperties?.mandatoryFields?.dynamicFields?.includes(taxonomy?.id)
                            ) {
                              return (
                                <Form.Item
                                  key={index}
                                  name={['dynamicFields', taxonomy?.id]}
                                  data-cy={`form-item-organizer-dynamic-fields-${index}`}
                                  label={bilingual({
                                    data: taxonomy?.name,
                                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                  })}
                                  rules={[
                                    {
                                      required: formFieldProperties?.mandatoryFields?.dynamicFields?.includes(
                                        taxonomy?.id,
                                      ),
                                      message: t('common.validations.informationRequired'),
                                    },
                                  ]}
                                  hidden={
                                    taxonomy?.isAdminOnly
                                      ? adminCheckHandler({ calendar, user })
                                        ? false
                                        : true
                                      : false
                                  }>
                                  <SortableTreeSelect
                                    setShowDialog={setShowDialog}
                                    dataCy={`tag-organizer-dynamic-field`}
                                    form={form}
                                    draggable
                                    fieldName={['dynamicFields', taxonomy?.id]}
                                    data-cy={`treeselect-organizer-dynamic-fields-${index}`}
                                    allowClear
                                    treeDefaultExpandAll
                                    notFoundContent={<NoContent />}
                                    clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                                    treeData={treeDynamicTaxonomyOptions(
                                      taxonomy?.concept,
                                      user,
                                      calendarContentLanguage,
                                    )}
                                  />
                                </Form.Item>
                              );
                            }
                          })}
                      </>
                    );
                })}
              </Form>
            </Col>
          </Row>
        </CustomModal>
      ) : (
        <>
          <QuickCreateSaving
            title={t('dashboard.events.addEditEvent.quickCreate.loaderModal.title')}
            text={t('dashboard.events.addEditEvent.quickCreate.loaderModal.text')}
            open={!loaderModalOpen}
            onCancel={() => setLoaderModalOpen(false)}
          />
        </>
      )}
    </>
  );
}

export default QuickCreateOrganization;
