import React, { useEffect, useRef, useState } from 'react';
import './quickCreatePlace.css';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text/Text';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../Button/Primary/Primary';
import { Row, Col, Form, Input, notification, Dropdown } from 'antd';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ContentLanguageInput from '../../ContentLanguageInput/ContentLanguageInput';
import { contentLanguage } from '../../../constants/contentLanguage';
import BilingualInput from '../../BilingualInput/BilingualInput';
import { treeTaxonomyOptions } from '../../TreeSelectOption/treeSelectOption.settings';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import TreeSelectOption from '../../TreeSelectOption/TreeSelectOption';
import NoContent from '../../NoContent/NoContent';
import Tags from '../../Tags/Common/Tags';
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

const { TextArea } = Input;

function QuickCreatePlace(props) {
  const {
    open,
    setOpen,
    calendarContentLanguage,
    calendarId,
    keyword,
    setKeyword,
    interfaceLanguage,
    setLocationPlace,
    locationPlace,
    eventForm,
    saveAsDraftHandler,
    setLoaderModalOpen,
    loaderModalOpen,
    setShowDialog,
  } = props;

  const [form] = Form.useForm();
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;
  const navigate = useNavigate();
  const { user } = useSelector(getUserDetails);
  const { eventId } = useParams();

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
          addressCountryEn: results[0].address_components.find((item) => item.types.includes('country'))?.long_name,
          addressLocality: results[0].address_components.find((item) => item.types.includes('locality'))?.long_name,
          addressLocalityEn: results[0].address_components.find((item) => item.types.includes('locality'))?.long_name,
          addressRegion: results[0].address_components.find((item) =>
            item.types.includes('administrative_area_level_1'),
          )?.short_name,
          addressRegionEn: results[0].address_components.find((item) =>
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
          streetAddressEn: streetAddress,
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
    return new Promise((resolve, reject) => {
      form
        .validateFields(['french', 'english', 'address'])
        .then(() => {
          var values = form.getFieldsValue(true);
          let languageKey;
          if (calendarContentLanguage == contentLanguage.ENGLISH) languageKey = 'en';
          else if (calendarContentLanguage == contentLanguage.FRENCH) languageKey = 'fr';
          let postalObj = {
            addressCountry: { [languageKey]: values.addressCountry },
            addressLocality: { [languageKey]: values.addressLocality },
            addressRegion: { [languageKey]: values.addressRegion },
            postalCode: values.postalCode,
            streetAddress: { [languageKey]: values.streetAddress },
          };

          if (calendarContentLanguage == contentLanguage.BILINGUAL) {
            postalObj.addressCountry = {
              fr: values.addressCountry,
              en: values.addressCountryEn,
            };
            postalObj.addressLocality = {
              fr: values.addressLocality,
              en: values.addressLocalityEn,
            };
            postalObj.addressRegion = {
              fr: values.addressRegion,
              en: values.addressRegionEn,
            };
            postalObj.streetAddress = {
              fr: values.streetAddress,
              en: values.streetAddressEn,
            };
          }
          if (!toggle) {
            setOpen(false);
            setLoaderModalOpen(true);
          }
          addPostalAddress({ data: postalObj, calendarId })
            .unwrap()
            .then((response) => {
              if (response && response?.statusCode == 202) {
                let name = {},
                  placeObj = {},
                  additionalType = undefined;
                if (values?.english)
                  name = {
                    en: values?.english,
                  };

                if (values?.french)
                  name = {
                    ...name,
                    fr: values?.french,
                  };
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
                    latitude: values?.latitude,
                    longitude: values?.longitude,
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
                  <ContentLanguageInput calendarContentLanguage={calendarContentLanguage} fieldName="place-name">
                    <BilingualInput defaultTab={interfaceLanguage}>
                      <Form.Item
                        name="french"
                        key={contentLanguage.FRENCH}
                        initialValue={
                          calendarContentLanguage === contentLanguage.BILINGUAL
                            ? interfaceLanguage === 'fr'
                              ? keyword
                              : undefined
                            : calendarContentLanguage === contentLanguage.FRENCH
                            ? keyword
                            : undefined
                        }
                        dependencies={['english']}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (value || getFieldValue('english')) {
                                return Promise.resolve();
                              } else
                                return Promise.reject(
                                  new Error(
                                    t('dashboard.events.addEditEvent.location.quickCreatePlace.validations.name'),
                                  ),
                                );
                            },
                          }),
                        ]}
                        data-cy="form-item-quick-create-place-name-french-label">
                        <TextArea
                          autoSize
                          autoComplete="off"
                          placeholder={t('dashboard.events.addEditEvent.location.quickCreatePlace.namePlaceholder')}
                          style={{
                            borderRadius: '4px',
                            border: `${
                              calendarContentLanguage === contentLanguage.BILINGUAL
                                ? '4px solid #E8E8E8'
                                : '1px solid #b6c1c9'
                            }`,
                            width: '100%',
                          }}
                          size="large"
                          data-cy="text-area-quick-create-place-name-french"
                        />
                      </Form.Item>
                      <Form.Item
                        name="english"
                        dependencies={['french']}
                        initialValue={
                          calendarContentLanguage === contentLanguage.BILINGUAL
                            ? interfaceLanguage === 'en'
                              ? keyword
                              : undefined
                            : calendarContentLanguage === contentLanguage.ENGLISH
                            ? keyword
                            : undefined
                        }
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (value || getFieldValue('french')) {
                                return Promise.resolve();
                              } else
                                return Promise.reject(
                                  new Error(
                                    t('dashboard.events.addEditEvent.location.quickCreatePlace.validations.name'),
                                  ),
                                );
                            },
                          }),
                        ]}
                        data-cy="form-item-quick-create-place-name-english-label">
                        <TextArea
                          autoSize
                          autoComplete="off"
                          placeholder={t('dashboard.events.addEditEvent.location.quickCreatePlace.namePlaceholder')}
                          style={{
                            borderRadius: '4px',
                            border: `${
                              calendarContentLanguage === contentLanguage.BILINGUAL
                                ? '4px solid #E8E8E8'
                                : '1px solid #b6c1c9'
                            }`,
                            width: '100%',
                          }}
                          size="large"
                          data-cy="text-area-quick-create-place-name-english"
                        />
                      </Form.Item>
                    </BilingualInput>
                  </ContentLanguageInput>
                  <Form.Item
                    name="address"
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
                    name="placeType"
                    label={taxonomyDetails(allTaxonomyData?.data, user, 'Type', 'name', false)}
                    data-cy="form-item-quick-create-place-type-label">
                    <TreeSelectOption
                      style={{
                        display: !taxonomyDetails(allTaxonomyData?.data, user, 'Type', 'name', false) && 'none',
                      }}
                      allowClear
                      treeDefaultExpandAll
                      placeholder={t('dashboard.events.addEditEvent.location.quickCreatePlace.typePlaceholder')}
                      notFoundContent={<NoContent />}
                      clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                      treeData={treeTaxonomyOptions(allTaxonomyData, user, 'Type', false, calendarContentLanguage)}
                      tagRender={(props) => {
                        const { closable, onClose, label } = props;
                        return (
                          <Tags
                            closable={closable}
                            onClose={onClose}
                            closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}
                            data-cy={`tags-quick-create-place-type-${label}`}>
                            {label}
                          </Tags>
                        );
                      }}
                      data-cy="treeselect-quick-create-place-type"
                    />
                  </Form.Item>
                  <Form.Item
                    name={'region'}
                    label={taxonomyDetails(
                      allTaxonomyData?.data,
                      user,
                      placeTaxonomyMappedFieldTypes.REGION,
                      'name',
                      false,
                    )}
                    data-cy="form-item-quick-create-place-region-label">
                    <TreeSelectOption
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
                      tagRender={(props) => {
                        const { label, closable, onClose } = props;
                        return (
                          <Tags
                            closable={closable}
                            onClose={onClose}
                            closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}
                            data-cy={`tags-quick-create-region-${label}`}>
                            {label}
                          </Tags>
                        );
                      }}
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
