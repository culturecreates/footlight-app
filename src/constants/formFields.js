import { Col, Form, Input, Popover, Row } from 'antd';
import NoContent from '../components/NoContent/NoContent';
import { CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { treeTaxonomyOptions } from '../components/TreeSelectOption/treeSelectOption.settings';
import ImageUpload from '../components/ImageUpload/ImageUpload';
import { bilingual, contentLanguageBilingual } from '../utils/bilingual';
import { Translation } from 'react-i18next';
import StyledInput from '../components/Input/Common';
import { formInitialValueHandler } from '../utils/formInitialValueHandler';
import { featureFlags } from '../utils/featureFlags';
import EventsSearch from '../components/Search/Events/EventsSearch';
import SelectionItem from '../components/List/SelectionItem';
import Outlined from '../components/Button/Outlined';
import { sourceOptions } from './sourceOptions';
import LoadingIndicator from '../components/LoadingIndicator';
import MultipleImageUpload from '../components/MultipleImageUpload';
import CreateMultiLingualFormItems from '../layout/CreateMultiLingualFormItems';
import MultiLingualTextEditor from '../components/MultilingualTextEditor/MultiLingualTextEditor';
import SortableTreeSelect from '../components/TreeSelectOption/SortableTreeSelect';
import { getEmbedUrl, validateVideoLink } from '../utils/getEmbedVideoUrl';

const { TextArea } = Input;

export const formCategory = {
  PRIMARY: 'Primary',
};

export const formTypes = {
  INPUT: 'Input',
  MULTISELECT: 'MultiSelect',
  TEXTAREA: 'TextArea',
  EDITOR: 'Editor',
  IMAGE: 'Image',
  SEARCH: 'LocationSearch',
};

export const dataTypes = {
  MULTI_LINGUAL: 'MultiLingual',
  STANDARD_FIELD: 'StandardField',
  STRING: 'String',
  IDENTITY_STRING: 'IdentityString',
  URI_STRING: 'URIString',
  IMAGE: 'Image',
  EMAIL: 'Email',
  URI_STRING_ARRAY: 'URIString[]',
};

export const subDataType = {
  VIDEO_URL: 'VideoUrl',
};

export const mappedFieldTypes = {
  NAME: 'name',
  DISAMBUGATING_DESCRIPTION: 'disambiguatingDescription',
  ADDITIONAL_TYPE: 'additionalType',
  DESCRIPTION: 'description',
  URL: 'url',
  IMAGE: 'image',
  LOGO: 'logo',
  CONTACT_NAME: 'contactPoint.name',
  CONTACT_URL: 'contactPoint.url',
  CONTACT_TELEPHONE: 'contactPoint.telephone',
  CONTACT_EMAIL: 'contactPoint.email',
  PLACE: 'place',
  SOCIAL_MEDIA_LINKS: 'socialMediaLinks',
};

export const formNames = {
  ORGANIZATION: {
    LOCATION: 'LOCATION',
  },
};

const rules = [
  {
    dataType: dataTypes.URI_STRING,
    rule: ({ subType }) =>
      subType === subDataType.VIDEO_URL
        ? [
            {
              validator: (rule, value) => validateVideoLink(rule, value),
            },
          ]
        : [
            {
              type: 'url',
              message: <Translation>{(t) => t('dashboard.events.addEditEvent.validations.url')}</Translation>,
            },
          ],
  },
  {
    dataType: dataTypes.EMAIL,
    rule: () => [
      {
        type: 'email',
        message: <Translation>{(t) => t('login.validations.invalidEmail')}</Translation>,
      },
    ],
  },
  {
    dataType: dataTypes.IMAGE,
    rule: ({ image, t, required }) => [
      ({ getFieldValue }) => ({
        validator() {
          if (
            (getFieldValue('image') != undefined && getFieldValue('image')?.length > 0) ||
            (image && !getFieldValue('image')) ||
            (image && getFieldValue('image')?.length > 0) ||
            !required
          ) {
            return Promise.resolve();
          } else
            return Promise.reject(
              new Error(t('dashboard.events.addEditEvent.validations.otherInformation.emptyImage')),
            );
        },
      }),
    ],
  },
];

export const checkMandatoryAdminOnlyFields = (fieldName, fieldList = []) => {
  if (fieldList?.length > 0) {
    return fieldList.some((field) => field.fieldName === fieldName);
  }
};

export const formFieldValue = [
  {
    type: formTypes.INPUT,
    element: ({
      subdatatype,
      datatype,
      data,
      calendarContentLanguage,
      name = [],
      placeholder,
      user,
      t,
      entityId,
      validations,
      required,
      mappedField,
      form,
    }) => {
      if (datatype === dataTypes.MULTI_LINGUAL)
        return (
          <CreateMultiLingualFormItems
            calendarContentLanguage={calendarContentLanguage}
            form={form}
            name={!Array.isArray(name) ? [name] : name}
            data={data}
            entityId={entityId}
            validations={
              validations && validations.trim() !== '' ? validations : t('common.validations.informationRequired')
            }
            dataCy={`input-text-area-${mappedField}-`}
            placeholder={placeholder}
            required={required}>
            <TextArea
              autoSize
              autoComplete="off"
              style={{
                borderRadius: '4px',
                border: `${calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
                width: '100%',
              }}
              size="large"
            />
          </CreateMultiLingualFormItems>
        );
      else if (datatype === dataTypes.URI_STRING) {
        if (subdatatype === subDataType.VIDEO_URL) {
          const initialValue = data?.uri || '';
          const embedUrl = getEmbedUrl(form.getFieldValue(mappedField));

          return (
            <Row style={{ margin: '0px' }} gutter={[12, 12]}>
              <Form.Item style={{ width: '100%', marginBottom: '0px' }} name={name} initialValue={initialValue}>
                <StyledInput
                  placeholder={contentLanguageBilingual({
                    data: placeholder,
                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                    calendarContentLanguage: calendarContentLanguage,
                  })}
                  addonBefore="URL"
                  data-cy={`input-${mappedField}`}
                />
              </Form.Item>
              {embedUrl !== '' && (
                <Col span={24} style={{ padding: '0px' }}>
                  <iframe
                    className="iframe-video-embed"
                    width="100%"
                    height="315"
                    src={embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen></iframe>
                </Col>
              )}
            </Row>
          );
        } else {
          return (
            <StyledInput
              placeholder={contentLanguageBilingual({
                data: placeholder,
                interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                calendarContentLanguage: calendarContentLanguage,
              })}
              data-cy={`input-${mappedField}`}
            />
          );
        }
      } else if (datatype === dataTypes.EMAIL)
        return (
          <StyledInput
            placeholder={contentLanguageBilingual({
              data: placeholder,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            })}
            data-cy={`input-${mappedField}`}
          />
        );
      else if (datatype === dataTypes.URI_STRING_ARRAY) {
        return (
          <Form.List
            name={name}
            initialValue={data?.length > 0 ? data : [undefined]}
            rules={[
              {
                validator: async (_, value) => {
                  if ((!value || value?.filter((link) => link)?.length < 1) && required) {
                    return Promise.reject();
                  }
                },
                message: t('common.validations.informationRequired'),
              },
            ]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field) => (
                  <Form.Item key={field.key}>
                    <Row gutter={[12, 0]} align={'middle'}>
                      <Col span={22}>
                        <Form.Item
                          {...field}
                          validateTrigger={['onChange', 'onBlur']}
                          noStyle
                          rules={[
                            {
                              type: 'url',
                              message: t('dashboard.events.addEditEvent.validations.url'),
                            },
                          ]}>
                          <StyledInput
                            addonBefore="URL"
                            autoComplete="off"
                            placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderWebsite')}
                            data-cy={`input-${mappedField}-${field.key}`}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        {fields?.length > 0 ? (
                          <DeleteOutlined
                            style={{ color: '#1B3DE6', fontSize: '16px' }}
                            onClick={() => remove(field.name)}
                            data-cy={`icon-delete-${mappedField}-${field.key}`}
                          />
                        ) : null}
                      </Col>
                    </Row>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Outlined
                    size="large"
                    label={t('dashboard.organization.createNew.addOrganization.addSocialMediaLinks')}
                    onClick={() => add()}
                    data-cy={`button-add-${mappedField}`}
                  />
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
        );
      } else
        return (
          <StyledInput
            placeholder={contentLanguageBilingual({
              data: placeholder,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            })}
            data-cy={`input-${mappedField}`}
          />
        );
    },
  },
  {
    type: formTypes.TEXTAREA,
    element: ({ placeholder, user, calendarContentLanguage, mappedField }) => (
      <TextArea
        autoSize
        autoComplete="off"
        placeholder={contentLanguageBilingual({
          data: placeholder,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          calendarContentLanguage: calendarContentLanguage,
        })}
        style={{
          borderRadius: '4px',
          border: `${calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
          width: '100%',
        }}
        size="large"
        data-cy={`input-text-area-${mappedField}`}
      />
    ),
  },
  {
    type: formTypes.MULTISELECT,
    element: ({
      taxonomyData,
      user,
      taxonomyAlias,
      isDynamicField,
      calendarContentLanguage,
      placeholder,
      mappedField,
      name,
      form,
      setShowDialog,
    }) => {
      return (
        <SortableTreeSelect
          setShowDialog={setShowDialog}
          dataCy={`tag-${mappedField}`}
          form={form}
          draggable
          fieldName={name}
          data-cy={`treeselect-${mappedField}`}
          allowClear
          treeDefaultExpandAll
          notFoundContent={<NoContent />}
          placeholder={contentLanguageBilingual({
            data: placeholder,
            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
            calendarContentLanguage: calendarContentLanguage,
          })}
          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
          treeData={treeTaxonomyOptions(taxonomyData, user, taxonomyAlias, isDynamicField, calendarContentLanguage)}
          style={{
            display:
              !treeTaxonomyOptions(taxonomyData, user, taxonomyAlias, isDynamicField, calendarContentLanguage) &&
              'none',
          }}
        />
      );
    },
  },
  {
    type: formTypes.IMAGE,
    element: ({
      form,
      largeUrl,
      originalUrl,
      imageReadOnly,
      preview,
      eventImageData,
      name,
      datatype,
      position,
      userTips,
      setImageCropOpen,
      imageCropOpen,
      largeAspectRatio,
      thumbnailAspectRatio,
      eventImageGalleryData,
      enableGallery,
      t,
      setShowDialog,
    }) => (
      <>
        {position === 'top' && datatype === dataTypes.IMAGE && <p className="add-event-date-heading">{userTips}</p>}
        <ImageUpload
          imageUrl={largeUrl}
          originalImageUrl={originalUrl}
          imageReadOnly={imageReadOnly}
          preview={preview}
          setImageCropOpen={name?.includes(mappedFieldTypes.IMAGE) ? setImageCropOpen : false}
          imageCropOpen={name?.includes(mappedFieldTypes.IMAGE) ? imageCropOpen : false}
          form={form}
          eventImageData={eventImageData}
          isCrop={name?.includes(mappedFieldTypes.IMAGE) ? featureFlags.imageCropFeature : false}
          largeAspectRatio={largeAspectRatio}
          thumbnailAspectRatio={thumbnailAspectRatio}
          formName={name}
        />
        {name?.includes(mappedFieldTypes.IMAGE) && (
          <Form.Item
            label={t('dashboard.events.addEditEvent.otherInformation.image.additionalImages')}
            data-cy="form-item-event-multiple-image"
            hidden={!enableGallery}>
            <Row>
              <Col>
                <p className="add-event-date-heading" data-cy="para-image-upload-sub-text">
                  {t('dashboard.events.addEditEvent.otherInformation.image.subHeading')}
                </p>
              </Col>
            </Row>
            <MultipleImageUpload
              setShowDialog={setShowDialog}
              form={form}
              largeAspectRatio={largeAspectRatio}
              thumbnailAspectRatio={thumbnailAspectRatio}
              eventImageData={eventImageGalleryData}
            />
          </Form.Item>
        )}
      </>
    ),
  },
  {
    type: formTypes.SEARCH,
    element: ({
      form,
      setIsPopoverOpen,
      isPopoverOpen,
      allPlacesList,
      locationPlace,
      setLocationPlace,
      t,
      placesSearch,
      calendarContentLanguage,
      allPlacesArtsdataList,
      allPlacesImportsFootlight,
      placeNavigationHandler,
      mappedField,
      isEntitiesFetching,
      isExternalSourceFetching,
      fieldName,
    }) => {
      return (
        <div>
          <Popover
            data-cy={`popover-${mappedField ?? fieldName}`}
            open={isPopoverOpen}
            onOpenChange={(open) => setIsPopoverOpen(open)}
            overlayClassName="event-popover"
            placement="bottom"
            autoAdjustOverflow={false}
            getPopupContainer={(trigger) => trigger.parentNode}
            trigger={['click']}
            content={
              <div>
                <div>
                  <>
                    <div
                      className="popover-section-header"
                      data-cy={`div-${mappedField ?? fieldName}-footlight-place-title`}>
                      {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                    </div>
                    <div className="search-scrollable-content">
                      {isEntitiesFetching && (
                        <div
                          style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LoadingIndicator />
                        </div>
                      )}
                      {!isEntitiesFetching &&
                        (allPlacesList?.length > 0 ? (
                          allPlacesList?.map((place, index) => (
                            <div
                              key={index}
                              className={`event-popover-options ${
                                locationPlace?.value == place?.value ? 'event-popover-options-active' : null
                              }`}
                              onClick={() => {
                                setLocationPlace(place);
                                form.setFieldValue(fieldName, place?.value);
                                setIsPopoverOpen(false);
                              }}
                              data-cy={`div-${mappedField ?? fieldName}-footlight-place-${index}`}>
                              {place?.label}
                            </div>
                          ))
                        ) : (
                          <NoContent />
                        ))}
                    </div>
                  </>

                  <div
                    className="popover-section-header"
                    data-cy={`div-${mappedField ?? fieldName}-footlight-place-title`}>
                    {t('dashboard.organization.createNew.search.importsFromFootlight')}
                  </div>
                  <div className="search-scrollable-content">
                    {isExternalSourceFetching && (
                      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LoadingIndicator />
                      </div>
                    )}
                    {!isExternalSourceFetching &&
                      (allPlacesImportsFootlight?.length > 0 ? (
                        allPlacesImportsFootlight?.map((place, index) => (
                          <div
                            key={index}
                            className={`event-popover-options ${
                              locationPlace?.value == place?.value ? 'event-popover-options-active' : null
                            }`}
                            onClick={() => {
                              setLocationPlace(place);
                              form.setFieldValue(fieldName, place?.value);
                              setIsPopoverOpen(false);
                            }}
                            data-cy={`div-${mappedField ?? fieldName}-footlight-place-${index}`}>
                            {place?.label}
                          </div>
                        ))
                      ) : (
                        <NoContent />
                      ))}
                  </div>

                  <div
                    className="popover-section-header"
                    data-cy={`div-${mappedField ?? fieldName}-artsdata-place-title`}>
                    {t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                  </div>
                  <div className="search-scrollable-content">
                    {isExternalSourceFetching && (
                      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LoadingIndicator />
                      </div>
                    )}
                    {!isExternalSourceFetching &&
                      (allPlacesArtsdataList?.length > 0 ? (
                        allPlacesArtsdataList?.map((place, index) => (
                          <div
                            key={index}
                            className="event-popover-options"
                            onClick={() => {
                              setLocationPlace(place);
                              form.setFieldValue(fieldName, place?.uri);
                              setIsPopoverOpen(false);
                            }}
                            data-cy={`div-${mappedField ?? fieldName}-artsdata-place-${index}`}>
                            {place?.label}
                          </div>
                        ))
                      ) : (
                        <NoContent />
                      ))}
                  </div>
                </div>
              </div>
            }>
            <EventsSearch
              style={{ borderRadius: '4px', width: '100%' }}
              placeholder={t('dashboard.events.addEditEvent.location.placeHolderLocation')}
              onChange={(e) => {
                placesSearch(e.target.value);
                setIsPopoverOpen(true);
              }}
              onClick={() => {
                setIsPopoverOpen(true);
              }}
              data-cy={`input-${mappedField ?? fieldName}`}
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
                form.setFieldValue(fieldName, undefined);
              }}
              edit={locationPlace?.source === sourceOptions.CMS && true}
              onEdit={(e) => placeNavigationHandler(locationPlace?.value, locationPlace?.type, e)}
              creatorId={locationPlace?.creatorId}
            />
          )}
        </div>
      );
    },
  },
  {
    type: formTypes.EDITOR,
    element: ({
      datatype,
      data,
      calendarContentLanguage,
      name = '',
      placeholder,
      required,
      form,
      entityId,
      descriptionMinimumWordCount,
    }) => {
      if (datatype === dataTypes.MULTI_LINGUAL)
        return (
          <MultiLingualTextEditor
            data={data}
            form={form}
            calendarContentLanguage={calendarContentLanguage}
            name={Array.isArray(name) ? name[0] : name}
            entityId={entityId}
            placeholder={placeholder}
            descriptionMinimumWordCount={descriptionMinimumWordCount}
            required={required}
          />
        );
    },
  },
];

export const renderFormFields = ({
  datatype,
  subDataType,
  element,
  initialValue = undefined,
  name,
  key,
  required,
  userTips,
  position,
  hidden,
  label,
  style,
  mappedField,
  t,
  validations,
  originalUrl,
  fieldName,
}) => {
  return (
    <>
      {position === 'top' && datatype !== dataTypes.IMAGE && <p className="add-event-date-heading">{userTips}</p>}
      <Form.Item
        data-cy={`form-item-${mappedField ?? fieldName?.toLowerCase()}`}
        label={label}
        name={name ?? fieldName?.toLowerCase()}
        key={key}
        initialValue={
          Array.isArray(initialValue)
            ? initialValue?.length > 0
              ? initialValue
              : datatype === dataTypes.URI_STRING_ARRAY
              ? [undefined]
              : []
            : initialValue
        }
        required={required}
        hidden={hidden}
        style={style}
        className={mappedField ?? fieldName?.toLowerCase()}
        rules={rules
          ?.map((rule) => {
            if (datatype === rule?.dataType) {
              return rule.rule({ subType: subDataType, image: originalUrl, t, required, fieldName });
            }
          })
          .concat([
            {
              required: required,
              message:
                validations && validations.trim() !== '' ? validations : t('common.validations.informationRequired'),
            },
          ])
          ?.flat()
          ?.filter((rule) => rule !== undefined)}
        help={
          position === 'bottom' && userTips ? (
            <p
              className="add-event-date-heading"
              style={{ marginTop: '-15px' }}
              data-cy={`form-item-helper-text-${mappedField ?? fieldName?.toLowerCase()}`}>
              {userTips}
            </p>
          ) : undefined
        }>
        {element}
      </Form.Item>
    </>
  );
};

export const returnFormDataWithFields = ({
  field,
  formField,
  allTaxonomyData,
  user,
  calendarContentLanguage,
  entityData,
  index,
  t,
  adminCheck,
  isCrop,
  currentCalendarData,
  imageCropOpen,
  setImageCropOpen,
  placesSearch,
  allPlacesList,
  allPlacesArtsdataList,
  allPlacesImportsFootlight,
  locationPlace,
  setLocationPlace,
  setIsPopoverOpen,
  isPopoverOpen,
  form,
  style,
  placeNavigationHandler,
  isExternalSourceFetching,
  isEntitiesFetching,
  adminOnlyFields,
  mandatoryFields,
  setShowDialog,
  entityId,
}) => {
  return renderFormFields({
    fieldName: field?.name,
    name: field?.mappedField && [field?.mappedField],
    mappedField: field?.mappedField,
    type: field?.type,
    datatype: field?.datatype,
    subDataType: field?.subDataType,
    required: checkMandatoryAdminOnlyFields(field?.name, mandatoryFields),
    element: formField?.element({
      fieldName: field?.name?.toLowerCase(),
      mappedField: field?.mappedField,
      data: entityData && entityData[field?.mappedField],
      datatype: field?.datatype,
      subdatatype: field?.subDataType,
      taxonomyData: allTaxonomyData,
      user: user,
      entityId,
      type: field?.type,
      isDynamicField: false,
      calendarContentLanguage,
      name: field?.mappedField && [field?.mappedField],
      preview: true,
      placeholder: bilingual({
        data: field?.placeholder,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
      }),
      validations: bilingual({
        data: field?.validations,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
      }),
      largeUrl:
        field?.mappedField === mappedFieldTypes.IMAGE
          ? entityData?.image?.find((image) => image?.isMain)?.large?.uri
          : field?.mappedField === mappedFieldTypes.LOGO && entityData?.logo?.large?.uri,
      originalUrl:
        field?.mappedField === mappedFieldTypes.IMAGE
          ? entityData?.image?.find((image) => image?.isMain)?.original?.uri
          : field?.mappedField === mappedFieldTypes.LOGO && entityData?.logo?.original?.uri,
      required: checkMandatoryAdminOnlyFields(field?.name, mandatoryFields),
      t: t,
      userTips: bilingual({
        data: field?.userTips?.text,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        calendarContentLanguage: calendarContentLanguage,
      }),
      position: field?.userTips?.position,
      isCrop: isCrop,
      setImageCropOpen,
      imageCropOpen,
      eventImageGalleryData: entityData?.image?.filter((image) => !image?.isMain),
      eventImageData:
        field?.mappedField === mappedFieldTypes.IMAGE
          ? entityData?.image?.find((image) => image?.isMain)
          : field?.mappedField === mappedFieldTypes.LOGO && entityData?.logo,
      largeAspectRatio:
        currentCalendarData?.imageConfig?.length > 0 ? currentCalendarData?.imageConfig[0]?.large?.aspectRatio : null,
      thumbnailAspectRatio:
        currentCalendarData?.imageConfig?.length > 0
          ? currentCalendarData?.imageConfig[0]?.thumbnail?.aspectRatio
          : null,
      enableGallery:
        currentCalendarData?.imageConfig?.length > 0 ? currentCalendarData?.imageConfig[0]?.enableGallery : false,
      placesSearch,
      allPlacesList,
      allPlacesArtsdataList,
      allPlacesImportsFootlight,
      locationPlace,
      setLocationPlace,
      setIsPopoverOpen,
      isPopoverOpen,
      form,
      taxonomyAlias: field?.taxonomyAlias,
      placeNavigationHandler,
      isExternalSourceFetching,
      isEntitiesFetching,
      // required: checkMandatoryAdminOnlyFields(field?.name, mandatoryFields),
      setShowDialog,
    }),
    key: index,
    initialValue: formInitialValueHandler(field?.type, field?.mappedField, field?.datatype, entityData),
    label: bilingual({
      data: field?.label,
      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
    }),
    userTips: bilingual({
      data: field?.userTips?.text,
      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
      calendarContentLanguage: calendarContentLanguage,
    }),
    position: field?.userTips?.position,
    hidden: checkMandatoryAdminOnlyFields(field?.name, adminOnlyFields) ? (adminCheck ? false : true) : false,
    form,
    style,
    taxonomyAlias: field?.taxonomyAlias,
    t,
    validations: bilingual({
      data: field?.validations,
      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
      locationPlace,
    }),
    originalUrl:
      field?.mappedField === mappedFieldTypes.IMAGE
        ? entityData?.image?.find((image) => image?.isMain)?.original?.uri
        : field?.mappedField === mappedFieldTypes.LOGO && entityData?.logo?.original?.uri,
  });
};
