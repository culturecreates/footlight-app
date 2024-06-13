import { Col, Form, Input, Popover, Row } from 'antd';
import NoContent from '../components/NoContent/NoContent';
import { CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import Tags from '../components/Tags/Common/Tags';
import TreeSelectOption from '../components/TreeSelectOption/TreeSelectOption';
import { treeTaxonomyOptions } from '../components/TreeSelectOption/treeSelectOption.settings';
import { contentLanguage } from './contentLanguage';
import ContentLanguageInput from '../components/ContentLanguageInput/ContentLanguageInput';
import BilingualInput from '../components/BilingualInput/BilingualInput';
import ImageUpload from '../components/ImageUpload/ImageUpload';
import { bilingual, contentLanguageBilingual } from '../utils/bilingual';
import { Translation } from 'react-i18next';
import StyledInput from '../components/Input/Common';
import { formInitialValueHandler } from '../utils/formInitialValueHandler';
import { featureFlags } from '../utils/featureFlags';
import EventsSearch from '../components/Search/Events/EventsSearch';
import SelectionItem from '../components/List/SelectionItem';
import BilingualTextEditor from '../components/BilingualTextEditor';
import Outlined from '../components/Button/Outlined';
import { sourceOptions } from './sourceOptions';
import LoadingIndicator from '../components/LoadingIndicator';
import MultipleImageUpload from '../components/MultipleImageUpload';

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
  SEARCH: 'Search',
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
    rule: {
      type: 'url',
      message: <Translation>{(t) => t('dashboard.events.addEditEvent.validations.url')}</Translation>,
    },
  },
  {
    dataType: dataTypes.EMAIL,
    rule: {
      type: 'email',
      message: <Translation>{(t) => t('login.validations.invalidEmail')}</Translation>,
    },
  },
];

const checkMandatoryAdminOnlyFields = (fieldName, fieldList = []) => {
  if (fieldList?.length > 0) {
    return fieldList.some((field) => field.fieldName === fieldName);
  }
};

export const formFieldValue = [
  {
    type: formTypes.INPUT,
    element: ({
      datatype,
      data,
      calendarContentLanguage,
      name = [],
      placeholder,
      user,
      t,
      validations,
      required,
      mappedField,
      form,
    }) => {
      if (datatype === dataTypes.MULTI_LINGUAL)
        return (
          <ContentLanguageInput
            calendarContentLanguage={calendarContentLanguage}
            isFieldsDirty={{
              en: form.isFieldTouched(name?.concat(['en'])),
              fr: form.isFieldTouched(name?.concat(['fr'])),
            }}>
            <BilingualInput fieldData={data}>
              <Form.Item
                name={[`${name}`, 'fr']}
                key={contentLanguage.FRENCH}
                dependencies={[`${name}`, 'en']}
                initialValue={data?.fr}
                rules={
                  required
                    ? [
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue([`${name}`, 'en'])) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(
                                new Error(validations ?? t('common.validations.informationRequired')),
                              );
                          },
                        }),
                      ]
                    : undefined
                }>
                <TextArea
                  autoSize
                  autoComplete="off"
                  placeholder={placeholder?.fr}
                  style={{
                    borderRadius: '4px',
                    border: `${
                      calendarContentLanguage === contentLanguage.BILINGUAL ? '4px solid #E8E8E8' : '1px solid #b6c1c9'
                    }`,
                    width: '423px',
                  }}
                  size="large"
                  data-cy={`input-text-area-${mappedField}-french`}
                />
              </Form.Item>

              <Form.Item
                name={[`${name}`, 'en']}
                key={contentLanguage.ENGLISH}
                dependencies={[`${name}`, 'fr']}
                initialValue={data?.en}
                rules={
                  required
                    ? [
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue([`${name}`, 'fr'])) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(
                                new Error(validations ?? t('common.validations.informationRequired')),
                              );
                          },
                        }),
                      ]
                    : undefined
                }>
                <TextArea
                  autoSize
                  autoComplete="off"
                  placeholder={placeholder?.en}
                  style={{
                    borderRadius: '4px',
                    border: `${
                      calendarContentLanguage === contentLanguage.BILINGUAL ? '4px solid #E8E8E8' : '1px solid #b6c1c9'
                    }`,
                    width: '100%',
                  }}
                  size="large"
                  data-cy={`input-text-area-${mappedField}-english`}
                />
              </Form.Item>
            </BilingualInput>
          </ContentLanguageInput>
        );
      else if (datatype === dataTypes.URI_STRING)
        return (
          <StyledInput
            addonBefore="URL"
            autoComplete="off"
            style={{ width: '100%' }}
            placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderWebsite')}
            data-cy={`input-${mappedField}`}
          />
        );
      else if (datatype === dataTypes.EMAIL)
        return (
          <StyledInput
            placeholder={contentLanguageBilingual({
              en: placeholder?.en,
              fr: placeholder?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            })}
            data-cy={`input-${mappedField}`}
          />
        );
      else if (datatype === dataTypes.URI_STRING_ARRAY) {
        return (
          <Form.List name={name} initialValue={data?.length > 0 ? data : [undefined]}>
            {(fields, { add, remove }) => (
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
                </Form.Item>
              </>
            )}
          </Form.List>
        );
      } else
        return (
          <StyledInput
            placeholder={contentLanguageBilingual({
              en: placeholder?.en,
              fr: placeholder?.fr,
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
          en: placeholder?.en,
          fr: placeholder?.fr,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          calendarContentLanguage: calendarContentLanguage,
        })}
        style={{
          borderRadius: '4px',
          border: `${
            calendarContentLanguage === contentLanguage.BILINGUAL ? '4px solid #E8E8E8' : '1px solid #b6c1c9'
          }`,
          width: '423px',
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
    }) => {
      return (
        <TreeSelectOption
          data-cy={`treeselect-${mappedField}`}
          allowClear
          treeDefaultExpandAll
          notFoundContent={<NoContent />}
          placeholder={contentLanguageBilingual({
            en: placeholder?.en,
            fr: placeholder?.fr,
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
          tagRender={(props) => {
            const { label, closable, onClose } = props;
            return (
              <Tags
                data-cy={`tag-${mappedField}-${label}`}
                closable={closable}
                onClose={onClose}
                closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                {label}
              </Tags>
            );
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
            className="subheading-wrap"
            data-cy="form-item-event-multiple-image"
            hidden={!enableGallery}>
            <MultipleImageUpload
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
      name,
      placesSearch,
      calendarContentLanguage,
      allPlacesArtsdataList,
      allPlacesImportsFootlight,
      placeNavigationHandler,
      mappedField,
      isEntitiesFetching,
      isExternalSourceFetching,
    }) => {
      return (
        <>
          <Popover
            data-cy={`popover-${mappedField}`}
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
                    <div className="popover-section-header" data-cy={`div-${mappedField}-footlight-place-title`}>
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
                                form.setFieldValue(name, place?.value);
                                setIsPopoverOpen(false);
                              }}
                              data-cy={`div-${mappedField}-footlight-place-${index}`}>
                              {place?.label}
                            </div>
                          ))
                        ) : (
                          <NoContent />
                        ))}
                    </div>
                  </>

                  <div className="popover-section-header" data-cy={`div-${mappedField}-footlight-place-title`}>
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
                              form.setFieldValue(name, place?.value);
                              setIsPopoverOpen(false);
                            }}
                            data-cy={`div-${mappedField}-footlight-place-${index}`}>
                            {place?.label}
                          </div>
                        ))
                      ) : (
                        <NoContent />
                      ))}
                  </div>

                  <div className="popover-section-header" data-cy={`div-${mappedField}-artsdata-place-title`}>
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
                              form.setFieldValue(name, place?.uri);
                              setIsPopoverOpen(false);
                            }}
                            data-cy={`div-${mappedField}-artsdata-place-${index}`}>
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
              style={{ borderRadius: '4px', width: '423px' }}
              placeholder={t('dashboard.events.addEditEvent.location.placeHolderLocation')}
              onChange={(e) => {
                placesSearch(e.target.value);
                setIsPopoverOpen(true);
              }}
              onClick={() => {
                setIsPopoverOpen(true);
              }}
              data-cy={`input-${mappedField}`}
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
                form.setFieldValue(name, undefined);
              }}
              edit={locationPlace?.source === sourceOptions.CMS && true}
              onEdit={(e) => placeNavigationHandler(locationPlace?.value, locationPlace?.type, e)}
              creatorId={locationPlace?.creatorId}
            />
          )}
        </>
      );
    },
  },
  {
    type: formTypes.EDITOR,
    element: ({
      datatype,
      data,
      calendarContentLanguage,
      name = [],
      placeholder,
      required,
      descriptionMinimumWordCount,
    }) => {
      if (datatype === dataTypes.MULTI_LINGUAL)
        return (
          <BilingualTextEditor
            data={data}
            calendarContentLanguage={calendarContentLanguage}
            name={name}
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
}) => {
  return (
    <>
      {position === 'top' && datatype !== dataTypes.IMAGE && <p className="add-event-date-heading">{userTips}</p>}
      <Form.Item
        data-cy={`form-item-${mappedField}`}
        label={label}
        name={name}
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
        className={mappedField}
        rules={rules
          ?.map((rule) => {
            if (datatype === rule?.dataType) return rule.rule;
          })
          .concat([
            {
              required: required,
              message: validations ?? t('common.validations.informationRequired'),
            },
          ])
          ?.filter((rule) => rule !== undefined)}
        help={
          position === 'bottom' && userTips ? (
            <p
              className="add-event-date-heading"
              style={{ marginTop: '-15px' }}
              data-cy={`form-item-helper-text-${mappedField}`}>
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
  adminCheckHandler,
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
}) => {
  return renderFormFields({
    fieldName: field?.name,
    name: [field?.mappedField],
    mappedField: field?.mappedField,
    type: field?.type,
    datatype: field?.datatype,
    required: checkMandatoryAdminOnlyFields(field?.name, mandatoryFields),
    element: formField?.element({
      mappedField: field?.mappedField,
      data: entityData && entityData[field?.mappedField],
      datatype: field?.datatype,
      taxonomyData: allTaxonomyData,
      user: user,
      type: field?.type,
      isDynamicField: false,
      calendarContentLanguage,
      name: [field?.mappedField],
      preview: true,
      placeholder: bilingual({
        en: field?.placeholder?.en,
        fr: field?.placeholder?.fr,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
      }),
      validations: bilingual({
        en: field?.validations?.en,
        fr: field?.validations?.fr,
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
        en: field?.userTips?.text?.en,
        fr: field?.userTips?.text?.fr,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        calendarContentLanguage: calendarContentLanguage,
      }),
      position: field?.userTips?.position,
      isCrop: isCrop,
      setImageCropOpen,
      imageCropOpen,
      eventImageGalleryData: entityData?.image?.filter((image) => !image?.isMain || image?.isMain === undefined),
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
    }),
    key: index,
    initialValue: formInitialValueHandler(field?.type, field?.mappedField, field?.datatype, entityData),
    label: bilingual({
      en: field?.label?.en,
      fr: field?.label?.fr,
      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
    }),
    userTips: bilingual({
      en: field?.userTips?.text?.en,
      fr: field?.userTips?.text?.fr,
      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
      calendarContentLanguage: calendarContentLanguage,
    }),
    position: field?.userTips?.position,
    hidden: checkMandatoryAdminOnlyFields(field?.name, adminOnlyFields) ? (adminCheckHandler() ? false : true) : false,
    form,
    style,
    taxonomyAlias: field?.taxonomyAlias,
    t,
    validations: bilingual({
      en: field?.validations?.en,
      fr: field?.validations?.fr,
      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
      locationPlace,
    }),
  });
};
