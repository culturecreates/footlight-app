import React, { useEffect, useState } from 'react';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text/Text';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../Button/Primary/Primary';
import { Row, Col, Form, Input, notification } from 'antd';
import ImageUpload from '../../ImageUpload/ImageUpload';
import StyledInput from '../../Input/Common';
import { useAddImageMutation } from '../../../services/image';
import { useAddOrganizationMutation, useLazyGetOrganizationQuery } from '../../../services/organization';
import './quickCreateOrganization.css';
import { treeEntitiesOption } from '../../TreeSelectOption/treeSelectOption.settings';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { entitiesClass } from '../../../constants/entitiesClass';
import { sourceOptions } from '../../../constants/sourceOptions';
import Outlined from '../../Button/Outlined';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import QuickCreateSaving from '../QuickCreateSaving/QuickCreateSaving';
import { eventPublishState } from '../../../constants/eventPublishState';
import CreateMultiLingualFormItems from '../../../layout/CreateMultiLingualFormItems';
import {
  createInitialNamesObjectFromKeyword,
  placeHolderCollectionCreator,
} from '../../../utils/MultiLingualFormItemSupportFunctions';
import { contentLanguageKeyMap } from '../../../constants/contentLanguage';

const { TextArea } = Input;

function QuickCreateOrganization(props) {
  const {
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

  const [addImage] = useAddImageMutation();
  const [addOrganization] = useAddOrganizationMutation();
  const [getOrganization] = useLazyGetOrganizationQuery();

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
  const createOrganizationHandler = (toggle = true) => {
    const validationFieldNames = [];
    calendarContentLanguage.forEach((language) => {
      validationFieldNames.push(['name', contentLanguageKeyMap[language]]);
    });
    return new Promise((resolve, reject) => {
      form
        .validateFields(validationFieldNames)
        .then(() => {
          var values = form.getFieldsValue(true);
          let name = {},
            url = {},
            organizationObj = {};

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
          organizationObj = {
            name,
            url,
          };
          if (values?.dragger?.length > 0 && values?.dragger[0]?.originFileObj) {
            const formdata = new FormData();
            formdata.append('file', values?.dragger[0].originFileObj);
            if (!toggle) {
              setLoaderModalOpen(true);
              setOpen(false);
            }
            formdata &&
              addImage({ data: formdata, calendarId })
                .unwrap()
                .then((response) => {
                  organizationObj['logo'] = response?.data;
                  addOrganization({ data: organizationObj, calendarId })
                    .unwrap()
                    .then((response) => {
                      if (toggle) {
                        notification.success({
                          description: t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.success'),
                          placement: 'top',
                          closeIcon: <></>,
                          maxCount: 1,
                          duration: 3,
                        });
                        setOpen(false);
                        setKeyword('');
                        getSelectedOrganizer(response?.id);
                      } else {
                        setKeyword('');
                        getSelectedOrganizer(response?.id);
                      }
                      setShowDialog(true);
                      resolve(response);
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                })
                .catch((error) => {
                  console.log(error);
                });
          } else {
            if (!toggle) {
              setLoaderModalOpen(true);
              setOpen(false);
            }
            addOrganization({ data: organizationObj, calendarId })
              .unwrap()
              .then((response) => {
                if (toggle) {
                  notification.success({
                    description: t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.success'),
                    placement: 'top',
                    closeIcon: <></>,
                    maxCount: 1,
                    duration: 3,
                  });
                  setKeyword('');
                  getSelectedOrganizer(response?.id);
                  setOpen(false);
                } else {
                  getSelectedOrganizer(response?.id);
                  setOpen(false);
                }
                setShowDialog(true);
                resolve(response);
              })
              .catch((error) => {
                console.log(error);
                reject(error);
              });
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  };

  const goToAddFullDetailsPageHandler = async (e) => {
    const response = await createOrganizationHandler(false);
    if (response) {
      setEvent([e, response]);
    }
  };

  return (
    <>
      {!loaderModalOpen ? (
        <CustomModal
          open={open}
          centered
          title={
            <span className="quick-create-organization-modal-title" data-cy="span-quick-create-organization-heading">
              {t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.title')}
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
                <Row>
                  <Col>
                    <span
                      className="quick-create-organization-modal-label"
                      data-cy="span-quick-create-organization-name-label">
                      {t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.name')}
                    </span>
                  </Col>
                </Row>
                <CreateMultiLingualFormItems
                  calendarContentLanguage={calendarContentLanguage}
                  form={form}
                  name={['name']}
                  data={createInitialNamesObjectFromKeyword(keyword, calendarContentLanguage)}
                  validations={t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.validations.name')}
                  dataCy={`input-quick-create-organization-name-`}
                  placeholder={placeHolderCollectionCreator({
                    t,
                    calendarContentLanguage,
                    placeholderBase:
                      'dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.namePlaceholder',
                    hasCommonPlaceHolder: true,
                  })}
                  required={true}>
                  <TextArea
                    autoSize
                    autoComplete="off"
                    style={{
                      borderRadius: '4px',
                      border: `${calendarContentLanguage.length > 1 ? '4px solid #E8E8E8' : '1px solid #b6c1c9'}`,
                      width: '100%',
                    }}
                    size="large"
                  />
                </CreateMultiLingualFormItems>
                <Form.Item
                  name="contactWebsiteUrl"
                  label={t('dashboard.events.addEditEvent.otherInformation.contact.website')}
                  rules={[
                    {
                      type: 'url',
                      message: t('dashboard.events.addEditEvent.validations.url'),
                    },
                  ]}
                  data-cy="form-item-quick-create-organizer-website-label">
                  <StyledInput
                    addonBefore="URL"
                    autoComplete="off"
                    placeholder={t(
                      'dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.websitePlaceholder',
                    )}
                    data-cy="input-quick-create-organization-website"
                  />
                </Form.Item>
                <Form.Item
                  label={t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.logo')}
                  name="draggerWrap"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator() {
                        if (
                          (getFieldValue('dragger') != undefined && getFieldValue('dragger')?.length > 0) ||
                          !getFieldValue('dragger') ||
                          getFieldValue('dragger')?.length > 0
                        ) {
                          return Promise.resolve();
                        } else
                          return Promise.reject(
                            new Error(t('dashboard.events.addEditEvent.validations.otherInformation.emptyImage')),
                          );
                      },
                    }),
                  ]}
                  data-cy="form-item-quick-create-organizer-logo-label">
                  <Row>
                    <Col>
                      <p
                        className="quick-create-organization-modal-sub-heading"
                        data-cy="para-quick-create-organization-logo-subheading">
                        {t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.logoSubHeading')}
                      </p>
                    </Col>
                  </Row>
                  <ImageUpload imageReadOnly={false} preview={false} />
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
  );
}

export default QuickCreateOrganization;
