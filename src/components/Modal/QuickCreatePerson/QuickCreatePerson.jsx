import React, { useEffect, useRef, useState } from 'react';
import './quickCreatePerson.css';
import { CloseCircleOutlined } from '@ant-design/icons';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text/Text';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../Button/Primary/Primary';
import { Row, Col, Form, Input, notification } from 'antd';
import ContentLanguageInput from '../../ContentLanguageInput/ContentLanguageInput';
import { contentLanguage } from '../../../constants/contentLanguage';
import BilingualInput from '../../BilingualInput/BilingualInput';
import StyledInput from '../../Input/Common';
import { treeEntitiesOption, treeTaxonomyOptions } from '../../TreeSelectOption/treeSelectOption.settings';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { entitiesClass } from '../../../constants/entitiesClass';
import { useAddPersonMutation, useLazyGetPersonQuery } from '../../../services/people';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';
import NoContent from '../../NoContent/NoContent';
import TreeSelectOption from '../../TreeSelectOption/TreeSelectOption';
import Tags from '../../Tags/Common/Tags';
import { sourceOptions } from '../../../constants/sourceOptions';
import Outlined from '../../Button/Outlined';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import QuickCreateSaving from '../QuickCreateSaving/QuickCreateSaving';
import { eventPublishState } from '../../../constants/eventPublishState';

const { TextArea } = Input;

function QuickCreatePerson(props) {
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
    return new Promise((resolve, reject) => {
      form
        .validateFields(['french', 'english'])
        .then(() => {
          var values = form.getFieldsValue(true);
          let name = {},
            url = {},
            occupation = [],
            personObj = {};

          if (values?.english)
            name = {
              en: values?.english,
            };

          if (values?.french)
            name = {
              ...name,
              fr: values?.french,
            };

          if (values?.contactWebsiteUrl)
            url = {
              uri: values?.contactWebsiteUrl,
            };
          if (values?.occupation) {
            occupation = values?.occupation?.map((occupationId) => {
              return {
                entityId: occupationId,
              };
            });
          }
          personObj = {
            name,
            url,
            occupation,
          };
          if (!toggle) {
            setOpen(false);
            setLoaderModalOpen(true);
          }
          addPerson({ data: personObj, calendarId })
            .unwrap()
            .then((response) => {
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
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => reject(error));
    });
  };

  const goToAddFullDetailsPageHandler = async (e) => {
    const response = await createPersonHandler(false);
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
                  <Row>
                    <Col>
                      <span className="quick-create-person-modal-label" data-cy="span-quick-create-person-name-label">
                        {t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.name')}
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
                                  new Error(
                                    t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.validations.name'),
                                  ),
                                );
                            },
                          }),
                        ]}
                        data-cy="form-item-quick-create-person-name-french-label">
                        <TextArea
                          autoSize
                          autoComplete="off"
                          placeholder={t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.namePlaceholder')}
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
                          data-cy="input-quick-create-person-name-french"
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
                                    t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.validations.name'),
                                  ),
                                );
                            },
                          }),
                        ]}
                        data-cy="form-item-quick-create-person-name-english-label">
                        <TextArea
                          autoSize
                          autoComplete="off"
                          placeholder={t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.namePlaceholder')}
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
                          data-cy="input-quick-create-person-name-english"
                        />
                      </Form.Item>
                    </BilingualInput>
                  </ContentLanguageInput>
                  <Form.Item
                    name="occupation"
                    label={taxonomyDetails(allTaxonomyData?.data, user, 'Occupation', 'name', false)}
                    hidden={taxonomyDetails(allTaxonomyData?.data, user, 'Occupation', 'name', false) ? false : true}
                    data-cy="form-item-quick-create-person-occupation-label">
                    <TreeSelectOption
                      style={{
                        display: !taxonomyDetails(allTaxonomyData?.data, user, 'Occupation', 'name', false) && 'none',
                      }}
                      placeholder={t(
                        'dashboard.events.addEditEvent.quickCreate.quickCreatePerson.occupationPlaceholder',
                      )}
                      allowClear
                      treeDefaultExpandAll
                      notFoundContent={<NoContent />}
                      clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                      treeData={treeTaxonomyOptions(
                        allTaxonomyData,
                        user,
                        'Occupation',
                        false,
                        calendarContentLanguage,
                      )}
                      data-cy="treeselect-quick-create-person-occupation"
                      tagRender={(props) => {
                        const { label, closable, onClose } = props;
                        return (
                          <Tags
                            closable={closable}
                            onClose={onClose}
                            closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}
                            data-cy={`tags-quick-create-person-occupation-${label}`}>
                            {label}
                          </Tags>
                        );
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="contactWebsiteUrl"
                    label={t('dashboard.events.addEditEvent.otherInformation.contact.website')}
                    rules={[
                      {
                        type: 'url',
                        message: t('dashboard.events.addEditEvent.validations.url'),
                      },
                    ]}
                    data-cy="form-item-quick-create-person-website-label">
                    <StyledInput
                      addonBefore="URL"
                      autoComplete="off"
                      placeholder={t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.websitePlaceholder')}
                      data-cy="input-quick-create-person-website"
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

export default QuickCreatePerson;
