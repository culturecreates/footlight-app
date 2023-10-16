import React, { useRef, useState } from 'react';
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
    eventForm,
  } = props;

  const [form] = Form.useForm();
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;

  const { user } = useSelector(getUserDetails);

  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.PLACE,
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [getPlace] = useLazyGetPlaceQuery();
  const [addPostalAddress] = useAddPostalAddressMutation();
  const [addPlace] = useAddPlaceMutation();

  const [address, setAddress] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleChange = (address) => {
    if (address === '') setDropdownOpen(false);
    else setDropdownOpen(true);
    setAddress(address);
  };

  const handleSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => {
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
        setLocationPlace(placesOptions([response], user, calendarContentLanguage)[0]);
        eventForm.setFieldValue('locationPlace', id);
      })
      .catch((error) => console.log(error));
  };
  const createPlaceHandler = () => {
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
                    notification.success({
                      description: t('dashboard.events.addEditEvent.location.quickCreatePlace.success'),
                      placement: 'top',
                      closeIcon: <></>,
                      maxCount: 1,
                      duration: 3,
                    });
                    setKeyword('');
                    getSelectedPlace(response?.id);
                    setOpen(false);
                  }
                })
                .catch((error) => console.log(error));
            }
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  };
  return (
    !taxonomyLoading && (
      <CustomModal
        open={open}
        destroyOnClose
        centered
        title={
          <span className="quick-create-place-modal-title">
            {t('dashboard.events.addEditEvent.location.quickCreatePlace.title')}
          </span>
        }
        onCancel={() => setOpen(false)}
        footer={[
          <TextButton
            key="cancel"
            size="large"
            label={t('dashboard.events.addEditEvent.location.quickCreatePlace.cancel')}
            onClick={() => setOpen(false)}
          />,
          <PrimaryButton
            key="add-dates"
            label={t('dashboard.events.addEditEvent.location.quickCreatePlace.create')}
            onClick={createPlaceHandler}
          />,
        ]}>
        <Row gutter={[0, 10]} className="quick-create-place-modal-wrapper">
          <Col span={24}>
            <Form form={form} layout="vertical" name="organizerForm" preserve={false}>
              <Row>
                <Col>
                  <p className="quick-create-place-modal-sub-heading">
                    {t('dashboard.events.addEditEvent.location.quickCreatePlace.subHeading')}
                  </p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <span className="quick-create-place-modal-label">
                    {t('dashboard.events.addEditEvent.location.quickCreatePlace.name')}
                  </span>
                </Col>
              </Row>
              <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
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
                              new Error(t('dashboard.events.addEditEvent.location.quickCreatePlace.validations.name')),
                            );
                        },
                      }),
                    ]}>
                    <TextArea
                      autoSize
                      autoComplete="off"
                      placeholder={t('dashboard.events.addEditEvent.location.quickCreatePlace.namePlaceholder')}
                      style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '100%' }}
                      size="large"
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
                              new Error(t('dashboard.events.addEditEvent.location.quickCreatePlace.validations.name')),
                            );
                        },
                      }),
                    ]}>
                    <TextArea
                      autoSize
                      autoComplete="off"
                      placeholder={t('dashboard.events.addEditEvent.location.quickCreatePlace.namePlaceholder')}
                      style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </BilingualInput>
              </ContentLanguageInput>
              <Form.Item
                name="address"
                label={t('dashboard.events.addEditEvent.location.quickCreatePlace.address')}
                required>
                <PlacesAutocomplete value={address} onChange={handleChange} onSelect={handleSelect}>
                  {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                    <Dropdown
                      open={dropdownOpen}
                      overlayClassName="filter-sort-dropdown-wrapper"
                      getPopupContainer={(trigger) => trigger.parentNode}
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
                      trigger={['click']}>
                      <StyledInput
                        autoComplete="off"
                        {...getInputProps({
                          placeholder: t('dashboard.events.addEditEvent.location.quickCreatePlace.searchPlaceholder'),
                        })}
                        prefix={
                          <SearchOutlined
                            className="events-search-icon"
                            style={{ color: '#B6C1C9', fontSize: '18px' }}
                          />
                        }
                      />
                    </Dropdown>
                  )}
                </PlacesAutocomplete>
              </Form.Item>

              <Form.Item name="placeType" label={taxonomyDetails(allTaxonomyData?.data, user, 'Type', 'name', false)}>
                <TreeSelectOption
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
                        closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                        {label}
                      </Tags>
                    );
                  }}
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
                )}>
                <TreeSelectOption
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
                        closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                        {label}
                      </Tags>
                    );
                  }}
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </CustomModal>
    )
  );
}

export default QuickCreatePlace;
