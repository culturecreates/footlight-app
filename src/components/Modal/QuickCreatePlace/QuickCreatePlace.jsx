import React, { useEffect, useRef, useState } from 'react';
import './quickCreatePlace.css';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text/Text';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../Button/Primary/Primary';
import { Row, Col, Form, Input, notification, Dropdown } from 'antd';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { contentLanguageKeyMap } from '../../../constants/contentLanguage';
import { treeTaxonomyOptions } from '../../TreeSelectOption/treeSelectOption.settings';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import NoContent from '../../NoContent/NoContent';
import StyledInput from '../../Input/Common';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';
import { useAddPostalAddressMutation } from '../../../services/postalAddress';
import { useAddPlaceMutation, useLazyGetPlaceQuery } from '../../../services/places';
import { placesOptions } from '../../Select/selectOption.settings';
import { placeTaxonomyMappedFieldTypes } from '../../../constants/placeMappedFieldTypes';
import Outlined from '../../Button/Outlined';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import QuickCreateSaving from '../QuickCreateSaving/QuickCreateSaving';
import { sourceOptions } from '../../../constants/sourceOptions';
import { entitiesClass } from '../../../constants/entitiesClass';
import { eventPublishState } from '../../../constants/eventPublishState';
import CreateMultiLingualFormItems from '../../../layout/CreateMultiLingualFormItems';
import {
  createInitialNamesObjectFromKeyword,
  placeHolderCollectionCreator,
} from '../../../utils/MultiLingualFormItemSupportFunctions';
import { placeFormRequiredFieldNames } from '../../../constants/placeFormRequiredFieldNames';
import SortableTreeSelect from '../../TreeSelectOption/SortableTreeSelect';

const { TextArea } = Input;

function QuickCreatePlace(props) {
  const {
    open,
    setOpen,
    calendarContentLanguage,
    calendarId,
    keyword,
    setKeyword,
    setLocationPlace,
    locationPlace,
    eventForm,
    saveAsDraftHandler,
    setLoaderModalOpen,
    loaderModalOpen,
    setShowDialog,
    currentCalendarData,
  } = props;

  const fieldNames = {
    name: 'name',
    region: 'region',
    address: 'address',
    placeType: 'placeType',
  };

  const [form] = Form.useForm();
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;
  const navigate = useNavigate();
  const { user } = useSelector(getUserDetails);
  const { eventId } = useParams();

  let requiredFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.place);
  let requiredFieldNames = requiredFields
    ? requiredFields[0]?.formFieldProperties?.mandatoryFields?.standardFields
        ?.map((field) => field?.fieldName)
        ?.concat(requiredFields[0]?.formFieldProperties?.mandatoryFields?.dynamicFields?.map((field) => field))
    : [];

  const [event, setEvent] = useState([]);
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
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.AddPlace}?id=${event[1]?.id}`, {
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
  }, [locationPlace]);

  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.PLACE);
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [getPlace] = useLazyGetPlaceQuery();
  const [addPostalAddress] = useAddPostalAddressMutation();
  const [addPlace] = useAddPlaceMutation();

  const [address, setAddress] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleChange = (value) => {
    if (value === '') setDropdownOpen(false);
    else setDropdownOpen(true);
  };

  const handleSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => {
        setAddress(results[0]?.formatted_address);
        form.setFieldsValue({
          address: results[0]?.formatted_address,
          addressCountry: results[0].address_components.find((item) => item.types.includes('country'))?.long_name,
          addressLocality: results[0].address_components.find((item) => item.types.includes('locality'))?.long_name,
          addressRegion: results[0].address_components.find((item) =>
            item.types.includes('administrative_area_level_1'),
          )?.short_name,
          postalCode: results[0].address_components.find((item) => item.types.includes('postal_code'))?.long_name,
        });
        let streetNumber =
          results[0].address_components.find((item) => item.types.includes('street_number'))?.long_name ?? null;
        let streetName = results[0].address_components.find((item) => item.types.includes('route'))?.long_name ?? null;
        let streetAddress = streetNumber + ' ' + streetName;
        if (streetNumber && streetName) streetAddress = streetNumber + ' ' + streetName;
        else if (streetNumber && !streetName) streetAddress = streetNumber;
        else if (!streetNumber && streetName) streetAddress = streetName;
        else if (!streetNumber && !streetName) streetAddress = null;
        form.setFieldsValue({
          streetAddress: streetAddress,
        });
        return getLatLng(results[0]);
      })
      .then((latLng) =>
        form.setFieldsValue({
          latitude: '' + latLng.lat,
          longitude: '' + latLng.lng,
        }),
      )
      .catch((error) => console.error(error));
    setDropdownOpen(false);
  };

  const getSelectedPlace = (id) => {
    getPlace({ placeId: id, calendarId })
      .unwrap()
      .then((response) => {
        let placeObj = response;
        placeObj = {
          ...placeObj,
          type: entitiesClass.place,
        };
        setLocationPlace(placesOptions([placeObj], user, calendarContentLanguage)[0], sourceOptions.CMS);
        eventForm.setFieldValue('locationPlace', id);
      })
      .catch((error) => console.log(error));
  };
  const createPlaceHandler = (toggle = true) => {
    let validationFieldNames = [];
    calendarContentLanguage.forEach((language) => {
      validationFieldNames.push([fieldNames.name, contentLanguageKeyMap[language]]);
    });
    if (requiredFieldNames?.includes(placeFormRequiredFieldNames.REGION)) {
      validationFieldNames.push(fieldNames.region);
    }
    return new Promise((resolve, reject) => {
      form
        .validateFields([...validationFieldNames, fieldNames.address])
        .then(() => {
          var values = form.getFieldsValue();
          var persistValues = form.getFieldsValue(true); // if toggle is false form is unmounted, hence the need to use both default and true values

          let addressCountry = {};
          let addressLocality = {};
          let addressRegion = {};
          let streetAddress = {};

          calendarContentLanguage.forEach((language) => {
            const languageKey = contentLanguageKeyMap[language];

            if (persistValues?.addressCountry) addressCountry[languageKey] = persistValues.addressCountry;
            if (persistValues?.addressLocality) addressLocality[languageKey] = persistValues.addressLocality;
            if (persistValues?.addressRegion) addressRegion[languageKey] = persistValues.addressRegion;
            if (persistValues?.streetAddress) streetAddress[languageKey] = persistValues.streetAddress;
          });

          const postalObj = {
            addressCountry,
            addressLocality,
            addressRegion,
            streetAddress,
            postalCode: persistValues.postalCode,
          };

          if (!toggle) {
            setOpen(false);
            setLoaderModalOpen(true);
          }

          addPostalAddress({ data: postalObj, calendarId })
            .unwrap()
            .then((response) => {
              if (response && response?.statusCode == 202) {
                let name = values?.name,
                  placeObj = {},
                  additionalType = undefined;

                if (values?.placeType) {
                  additionalType = values?.placeType?.map((placeTypeId) => {
                    return {
                      entityId: placeTypeId,
                    };
                  });
                }
                placeObj = {
                  name,
                  additionalType,
                  geo: {
                    latitude: persistValues?.latitude,
                    longitude: persistValues?.longitude,
                  },
                  postalAddressId: {
                    entityId: response?.id,
                  },
                  regions: values?.region
                    ? values.region.map((item) => {
                        const obj = {
                          entityId: item,
                        };
                        return obj;
                      })
                    : undefined,
                };
                addPlace({ data: placeObj, calendarId })
                  .unwrap()
                  .then((response) => {
                    if (response && response?.statusCode == 202) {
                      if (toggle) {
                        notification.success({
                          description: t('dashboard.events.addEditEvent.location.quickCreatePlace.success'),
                          placement: 'top',
                          closeIcon: <></>,
                          maxCount: 1,
                          duration: 3,
                        });
                      }
                      setKeyword('');
                      setShowDialog(true);
                      getSelectedPlace(response?.id);
                      setOpen(false);
                      resolve(response);
                    }
                  })
                  .catch((error) => console.log(error));
              }
            })
            .catch((error) => console.log(error));
        })
        .catch((error) => reject(error));
    });
  };

  const goToAddFullDetailsPageHandler = async (e) => {
    const response = await createPlaceHandler(false);
    if (response) {
      setEvent([e, response]);
    }
  };

  return (
    !taxonomyLoading && (
      <>
        {!loaderModalOpen ? (
          <CustomModal
            open={open}
            centered
            title={
              <span className="quick-create-place-modal-title" data-cy="span-quick-create-modal-heading">
                {t('dashboard.events.addEditEvent.location.quickCreatePlace.title')}
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
                    data-cy="button-cancel-quick-create-place"
                  />
                  <PrimaryButton
                    key="add-dates"
                    label={t('dashboard.events.addEditEvent.quickCreate.create')}
                    onClick={createPlaceHandler}
                    data-cy="button-save-quick-create-place"
                  />
                </div>
              </div>
            }>
            <Row gutter={[0, 10]} className="quick-create-place-modal-wrapper">
              <Col span={24}>
                <Form form={form} layout="vertical" name="organizerForm" preserve={false}>
                  <Row>
                    <Col>
                      <p className="quick-create-place-modal-sub-heading" data-cy="para-quick-create-modal-subheading">
                        {t('dashboard.events.addEditEvent.location.quickCreatePlace.subHeading')}
                      </p>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <span className="quick-create-place-modal-label" data-cy="para-quick-create-place-name-label">
                        {t('dashboard.events.addEditEvent.location.quickCreatePlace.name')}
                      </span>
                    </Col>
                  </Row>
                  <CreateMultiLingualFormItems
                    calendarContentLanguage={calendarContentLanguage}
                    form={form}
                    name={[fieldNames.name]}
                    data={createInitialNamesObjectFromKeyword(keyword, calendarContentLanguage)}
                    validations={t('dashboard.events.addEditEvent.validations.title')}
                    dataCy={`text-area-quick-create-place-name-`}
                    placeholder={placeHolderCollectionCreator({
                      t,
                      calendarContentLanguage,
                      placeholderBase: 'dashboard.events.addEditEvent.location.quickCreatePlace.namePlaceholder',
                      hasCommonPlaceHolder: true,
                    })}
                    required={true}>
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

                  <Form.Item
                    name={fieldNames.address}
                    label={t('dashboard.events.addEditEvent.location.quickCreatePlace.address')}
                    validateTrigger={['onBlur']}
                    rules={[
                      {
                        validator: (rules, value) => {
                          if (address === '' || value !== address) {
                            return Promise.reject(
                              t('dashboard.events.addEditEvent.location.quickCreatePlace.validations.address'),
                            );
                          } else {
                            return Promise.resolve();
                          }
                        },
                        message: t('dashboard.events.addEditEvent.location.quickCreatePlace.validations.address'),
                      },
                    ]}
                    required
                    data-cy="form-item-quick-create-place-address-label">
                    <PlacesAutocomplete
                      searchOptions={{ componentRestrictions: { country: 'CA' } }}
                      value={address}
                      onChange={handleChange}
                      onSelect={handleSelect}
                      googleCallbackName="initOne">
                      {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                        <Dropdown
                          open={dropdownOpen}
                          overlayClassName="filter-sort-dropdown-wrapper"
                          getPopupContainer={(trigger) => trigger.parentNode}
                          onBlur={() => setDropdownOpen(false)}
                          menu={{
                            items: suggestions?.map((suggestion, index) => {
                              return {
                                key: index,
                                label: (
                                  <div {...getSuggestionItemProps(suggestion)} key={index}>
                                    <span>{suggestion.description}</span>
                                  </div>
                                ),
                              };
                            }),
                            selectable: true,
                          }}
                          trigger={['click']}
                          data-cy="dropwdown-google-places">
                          <StyledInput
                            autoComplete="off"
                            {...getInputProps({
                              placeholder: t(
                                'dashboard.events.addEditEvent.location.quickCreatePlace.searchPlaceholder',
                              ),
                            })}
                            prefix={
                              <SearchOutlined
                                className="events-search-icon"
                                style={{ color: '#B6C1C9', fontSize: '18px' }}
                              />
                            }
                            data-cy="input-quick-create-google-place-keyword"
                          />
                        </Dropdown>
                      )}
                    </PlacesAutocomplete>
                  </Form.Item>

                  <Form.Item
                    name={fieldNames.placeType}
                    label={taxonomyDetails(allTaxonomyData?.data, user, 'Type', 'name', false)}
                    data-cy="form-item-quick-create-place-type-label">
                    <SortableTreeSelect
                      form={form}
                      draggable
                      fieldName={fieldNames.placeType}
                      style={{
                        display: !taxonomyDetails(allTaxonomyData?.data, user, 'Type', 'name', false) && 'none',
                      }}
                      allowClear
                      treeDefaultExpandAll
                      placeholder={t('dashboard.events.addEditEvent.location.quickCreatePlace.typePlaceholder')}
                      notFoundContent={<NoContent />}
                      clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                      treeData={treeTaxonomyOptions(allTaxonomyData, user, 'Type', false, calendarContentLanguage)}
                      data-cy="treeselect-quick-create-place-type"
                    />
                  </Form.Item>
                  <Form.Item
                    name={fieldNames.region}
                    label={taxonomyDetails(
                      allTaxonomyData?.data,
                      user,
                      placeTaxonomyMappedFieldTypes.REGION,
                      'name',
                      false,
                    )}
                    rules={[
                      {
                        required: requiredFieldNames?.includes(placeFormRequiredFieldNames?.REGION),
                        message: t('common.validations.informationRequired'),
                      },
                    ]}
                    data-cy="form-item-quick-create-place-region-label">
                    <SortableTreeSelect
                      form={form}
                      draggable
                      fieldName={fieldNames.region}
                      style={{
                        display:
                          !taxonomyDetails(
                            allTaxonomyData?.data,
                            user,
                            placeTaxonomyMappedFieldTypes.REGION,
                            'name',
                            false,
                          ) && 'none',
                      }}
                      placeholder={t('dashboard.places.createNew.addPlace.address.region.placeholder')}
                      allowClear
                      treeDefaultExpandAll
                      notFoundContent={<NoContent />}
                      clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                      treeData={treeTaxonomyOptions(
                        allTaxonomyData,
                        user,
                        placeTaxonomyMappedFieldTypes.REGION,
                        false,
                        calendarContentLanguage,
                      )}
                      data-cy="treeselect-quick-create-region"
                    />
                  </Form.Item>
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

export default QuickCreatePlace;
