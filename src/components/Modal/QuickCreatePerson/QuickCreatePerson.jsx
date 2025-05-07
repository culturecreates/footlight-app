import React, { useEffect, useRef, useState } from 'react';
import './quickCreatePerson.css';
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text/Text';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../Button/Primary/Primary';
import { Row, Col, Form, notification, Button, message } from 'antd';
import { treeDynamicTaxonomyOptions, treeEntitiesOption } from '../../TreeSelectOption/treeSelectOption.settings';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { entitiesClass } from '../../../constants/entitiesClass';
import { useAddPersonMutation, useLazyGetPersonQuery } from '../../../services/people';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import NoContent from '../../NoContent/NoContent';
import { sourceOptions } from '../../../constants/sourceOptions';
import Outlined from '../../Button/Outlined';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import QuickCreateSaving from '../QuickCreateSaving/QuickCreateSaving';
import { eventPublishState } from '../../../constants/eventPublishState';
import { contentLanguageKeyMap } from '../../../constants/contentLanguage';
import SortableTreeSelect from '../../TreeSelectOption/SortableTreeSelect';
import {
  checkMandatoryAdminOnlyFields,
  formCategory,
  formFieldValue,
  returnFormDataWithFields,
} from '../../../constants/formFields';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { formFieldsHandler } from '../../../utils/formFieldsHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import { bilingual } from '../../../utils/bilingual';
import { createInitialNamesObjectFromKeyword } from '../../../utils/MultiLingualFormItemSupportFunctions';
import { formPayloadHandler } from '../../../utils/formPayloadHandler';
import { uploadImageListHelper } from '../../../utils/uploadImageListHelper';
import { useAddImageMutation } from '../../../services/image';

function QuickCreatePerson(props) {
  const {
    //eslint-disable-next-line no-unused-vars
    open,
    setOpen,
    calendarContentLanguage,
    calendarId,
    keyword,
    setKeyword,
    setSelectedOrganizers,
    selectedOrganizers,
    selectedPerformers,
    eventForm,
    setSelectedPerformers,
    selectedSupporters,
    setSelectedSupporters,
    selectedOrganizerPerformerSupporterType,
    organizerPerformerSupporterTypes,
    saveAsDraftHandler,
    setLoaderModalOpen,
    loaderModalOpen,
    setShowDialog,
  } = props;
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;
  const { eventId } = useParams();

  const { user } = useSelector(getUserDetails);
  const navigate = useNavigate();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
  ] = useOutletContext();

  const [event, setEvent] = useState([]);
  const [imageCropOpen, setImageCropOpen] = useState(false);

  let fields = formFieldsHandler(currentCalendarData?.forms, entitiesClass.person);
  let formFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.person);
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
  let personData = {
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
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.AddPerson}?id=${event[1]?.id}`, {
              state: {
                data: { isRoutingToEventPage: eventId ? location.pathname : `${location.pathname}/${res}` },
              },
            });
          }
        })
        .catch((error) => {
          if (error) {
            setLoaderModalOpen(false);
          }
        });
    }
  }, [selectedOrganizers, selectedPerformers, selectedSupporters]);

  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.PERSON);
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [addPerson] = useAddPersonMutation();
  const [getPerson] = useLazyGetPersonQuery();
  const [addImage] = useAddImageMutation();

  const getSelectedPerson = (id) => {
    getPerson({ personId: id, calendarId })
      .unwrap()
      .then((response) => {
        let createdPerson = [
          {
            disambiguatingDescription: response?.disambiguatingDescription,
            id: response?.id,
            name: response?.name,
            type: entitiesClass.person,
            image: response?.image?.find((image) => image?.isMain),
          },
        ];
        createdPerson = treeEntitiesOption(createdPerson, user, calendarContentLanguage, sourceOptions.CMS);
        if (createdPerson?.length === 1) {
          switch (selectedOrganizerPerformerSupporterType) {
            case organizerPerformerSupporterTypes.organizer:
              setSelectedOrganizers([...selectedOrganizers, createdPerson[0]]);
              break;
            case organizerPerformerSupporterTypes.performer:
              setSelectedPerformers([...selectedPerformers, createdPerson[0]]);
              break;
            case organizerPerformerSupporterTypes.supporter:
              setSelectedSupporters([...selectedSupporters, createdPerson[0]]);
              break;

            default:
              break;
          }
        }
      })
      .catch((error) => console.log(error));
  };
  const createPersonHandler = (toggle = true) => {
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
          let personObj = {};
          Object.keys(values)?.map((object) => {
            let payload = formPayloadHandler(values[object], object, formFields, calendarContentLanguage);
            if (payload) {
              let newKeys = Object.keys(payload);
              personObj = {
                ...personObj,
                ...(newKeys?.length > 0 && { [newKeys[0]]: payload[newKeys[0]] }),
              };
            }
          });

          try {
            const formImageCrop = form.getFieldValue('imageCrop');
            const mainImageOptions = form.getFieldValue('mainImageOptions');
            const getImageCrop = (crop, entityId = null, responseData = null) => ({
              large: {
                xCoordinate: crop?.large?.x,
                yCoordinate: crop?.large?.y,
                height: crop?.large?.height,
                width: crop?.large?.width,
              },
              thumbnail: {
                xCoordinate: crop?.thumbnail?.x,
                yCoordinate: crop?.thumbnail?.y,
                height: crop?.thumbnail?.height,
                width: crop?.thumbnail?.width,
              },
              original: {
                entityId: entityId || crop?.original?.entityId,
                height: responseData?.height ?? crop?.original?.height,
                width: responseData?.width ?? crop?.original?.width,
              },
              isMain: true,
              description: mainImageOptions?.altText,
              creditText: mainImageOptions?.credit,
              caption: mainImageOptions?.caption,
            });
            let imageCrop = formImageCrop ? [getImageCrop(formImageCrop)] : [];

            if (!toggle) {
              setOpen(false);
              setLoaderModalOpen(true);
            }

            const hasMultipleImages = values.multipleImagesCrop?.length > 0;
            const hasNewMainImage = values?.image?.length > 0 && values?.image[0]?.originFileObj;

            if (hasNewMainImage) {
              const formData = new FormData();
              formData.append('file', values.image[0].originFileObj);

              const response = await addImage({ data: formData, calendarId }).unwrap();
              const entityId = response?.data?.original?.entityId;

              imageCrop = [getImageCrop(formImageCrop, entityId, response?.data)];
            }

            if (hasMultipleImages) {
              await uploadImageListHelper(values, addImage, calendarId, imageCrop);
            }

            if (!hasNewMainImage && values?.image?.length === 0 && !hasMultipleImages) {
              personObj['image'] = [];
            } else {
              personObj['image'] = imageCrop ?? [];
            }

            const response = await addPerson({ data: personObj, calendarId }).unwrap();

            if (toggle) {
              notification.success({
                description: t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.success'),
                placement: 'top',
                closeIcon: <></>,
                maxCount: 1,
                duration: 3,
              });
            }

            setKeyword('');
            setOpen(false);
            getSelectedPerson(response?.id);
            setShowDialog(true);
            resolve(response);
          } catch (error) {
            console.log(error);
            reject(error);
          }
        })
        .catch((error) => reject(error));
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
        const response = await createPersonHandler(false);
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
    !taxonomyLoading && (
      <>
        {!loaderModalOpen ? (
          <CustomModal
            bodyStyle={{
              maxHeight: '60vh',
              minHeight: '10vh',
              overflowY: 'auto',
            }}
            open={open}
            centered
            title={
              <span className="quick-create-person-modal-title" data-cy="span-quick-create-person-heading">
                {t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.title')}
              </span>
            }
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
                    data-cy="button-quick-create-person-cancel"
                  />
                  <PrimaryButton
                    key="add-dates"
                    label={t('dashboard.events.addEditEvent.quickCreate.create')}
                    onClick={createPersonHandler}
                    data-cy="button-quick-create-person-save"
                  />
                </div>
              </div>
            }>
            <Row gutter={[0, 10]} className="quick-create-person-modal-wrapper">
              <Col span={24}>
                <Form form={form} layout="vertical" name="organizerForm" preserve={false}>
                  <Row>
                    <Col>
                      <p
                        className="quick-create-person-modal-sub-heading"
                        data-cy="para-quick-create-person-subheading">
                        {t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.subHeading')}
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
                                  entityId: null,
                                  entityData: personData,
                                  index,
                                  t,
                                  adminCheck: adminCheckHandler({ calendar, user }),
                                  currentCalendarData,
                                  imageCropOpen,
                                  setImageCropOpen,
                                  form,
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
                                    data-cy={`form-item-person-dynamic-fields-${index}`}
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
                                      dataCy={`tag-person-dynamic-field`}
                                      form={form}
                                      draggable
                                      fieldName={['dynamicFields', taxonomy?.id]}
                                      data-cy={`treeselect-person-dynamic-fields-${index}`}
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
    )
  );
}

export default QuickCreatePerson;
