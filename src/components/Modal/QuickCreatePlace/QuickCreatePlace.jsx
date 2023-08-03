import React, { useRef, useState } from 'react';
import './quickCreatePlace.css';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text/Text';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../Button/Primary/Primary';
import { Row, Col, Form, Input } from 'antd';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { CloseCircleOutlined } from '@ant-design/icons';
import ContentLanguageInput from '../../ContentLanguageInput/ContentLanguageInput';
import { contentLanguage } from '../../../constants/contentLanguage';
import BilingualInput from '../../BilingualInput/BilingualInput';
import { treeEntitiesOption, treeTaxonomyOptions } from '../../TreeSelectOption/treeSelectOption.settings';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { entitiesClass } from '../../../constants/entitiesClass';
import { useLazyGetPersonQuery } from '../../../services/people';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import TreeSelectOption from '../../TreeSelectOption/TreeSelectOption';
import NoContent from '../../NoContent/NoContent';
import Tags from '../../Tags/Common/Tags';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';
import { useAddPostalAddressMutation } from '../../../services/postalAddress';
import { useAddPlaceMutation } from '../../../services/places';

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
    setSelectedOrganizers,
    selectedOrganizers,
    selectedPerformers,
    setSelectedPerformers,
    selectedSupporters,
    setSelectedSupporters,
    selectedOrganizerPerformerSupporterType,
    organizerPerformerSupporterTypes,
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
  const [getPerson] = useLazyGetPersonQuery();
  const [addPostalAddress] = useAddPostalAddressMutation();
  const [addPlace] = useAddPlaceMutation();

  const [address, setAddress] = useState('');

  const handleChange = (address) => {
    setAddress(address);
  };

  const handleSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => {
        form.setFieldsValue({
          address: results[0].address_components.find((item) => item.types.includes('country'))?.long_name,
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
      .catch((error) => console.error('Error', error));
  };

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
            image: response?.image,
          },
        ];
        createdPerson = treeEntitiesOption(createdPerson, user, calendarContentLanguage);
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
  const createPersonHandler = () => {
    form
      .validateFields(['french', 'english'])
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
        console.log(values);
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
              };
              addPlace({ data: placeObj, calendarId })
                .unwrap()
                .then((response) => {
                  console.log(response);
                })
                .catch((error) => console.log(error));
            }
          })
          .catch((error) => console.log(error));
        setKeyword('');
        if (!values) getSelectedPerson('1');
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
            onClick={createPersonHandler}
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
              <Form.Item name="address" label={t('dashboard.events.addEditEvent.location.quickCreatePlace.address')}>
                <PlacesAutocomplete
                  value={address}
                  onChange={handleChange}
                  onSelect={handleSelect}
                  placeholder={'Place name'}>
                  {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                    <div>
                      <input
                        {...getInputProps({
                          placeholder: 'Search Places ...',
                          className: 'location-search-input',
                        })}
                      />
                      <div className="autocomplete-dropdown-container">
                        {loading && <div>Loading...</div>}
                        {suggestions?.map((suggestion, index) => {
                          const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item';
                          // inline style for demonstration purpose
                          const style = suggestion.active
                            ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                            : { backgroundColor: '#ffffff', cursor: 'pointer' };
                          return (
                            <div
                              {...getSuggestionItemProps(suggestion, {
                                className,
                                style,
                              })}
                              key={index}>
                              <span>{suggestion.description}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
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
            </Form>
          </Col>
        </Row>
      </CustomModal>
    )
  );
}

export default QuickCreatePlace;
