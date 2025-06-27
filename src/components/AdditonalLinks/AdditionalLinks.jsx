import React, { useEffect } from 'react';
import { Form, Input, Select, Space, Row, Col } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import CreateMultiLingualFormItems from '../../layout/CreateMultiLingualFormItems';
import { Translation, useTranslation } from 'react-i18next';
import StyledInput from '../Input/Common';
import Outlined from '../Button/Outlined';
import { placeHolderCollectionCreator } from '../../utils/MultiLingualFormItemSupportFunctions';

const { TextArea } = Input;

const AdditionalLinks = ({
  form,
  name,
  validations,
  mappedField,
  calendarContentLanguage,
  entityId,
  initialData,
  required,
}) => {
  const { t } = useTranslation();

  const linkOptions = [
    {
      label: 'URL',
      value: 'url',
    },
    {
      label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.contact.email')}</Translation>,
      value: 'email',
    },
  ];

  useEffect(() => {
    const formattedData =
      initialData && initialData.length > 0
        ? initialData.map((item) => {
            if (item.uri) {
              return {
                type: 'url',
                value: item.uri,
                name: item.name || {},
              };
            } else if (item.email) {
              return {
                type: 'email',
                value: item.email,
                name: item.name || {},
              };
            }
            return { type: 'url', value: '', name: {} };
          })
        : [{ type: 'url', value: '', name: {} }];

    form.setFieldsValue({ [name]: formattedData });
  }, [initialData, form, name]);

  const validateInput = (rule, value, callback) => {
    const fieldPath = rule.field.split('.');
    const fieldIndex = parseInt(fieldPath[1]);
    const currentFields = form.getFieldValue(name) || [];
    const type = currentFields[fieldIndex]?.type;

    const isOnlyField = currentFields.length === 1;
    if (!value && !isOnlyField) {
      callback(t('common.components.additionalLinks.validations.required'));
      return;
    }

    if (value) {
      if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          callback(t('common.components.additionalLinks.validations.email'));
          return;
        }
      } else if (type === 'url') {
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlRegex.test(value)) {
          callback(t('common.components.additionalLinks.validations.url'));
          return;
        }
      }
    }

    callback();
  };

  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name: fieldName, ...restField }, index) => {
            const fieldValue = form.getFieldValue([name, fieldName]);
            const currentType = fieldValue?.type || 'url';
            const isOnlyField = fields.length === 1;

            return (
              <Row
                key={key}
                style={{
                  position: 'relative',
                  padding: '36px 12px 12px 12px',
                  border: '1px solid #B6C1C9',
                  marginBottom: '24px',
                  borderRadius: '4px',
                }}>
                <Space.Compact block size="large" align="baseline" style={{ width: '100%', marginBottom: 24 }}>
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'type']}
                    initialValue={currentType}
                    style={{ marginBottom: 0 }}>
                    <Select
                      className="ticket-link-select"
                      options={linkOptions}
                      onChange={(value) => {
                        form.setFieldsValue({
                          [name]: form
                            .getFieldValue(name)
                            .map((item, i) => (i === index ? { ...item, type: value, value: '' } : item)),
                        });
                      }}
                      size="large"
                      style={{ width: '100px', display: 'flex' }}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[fieldName, 'value']}
                    rules={[
                      {
                        required: !isOnlyField || required,
                        validator: validateInput,
                      },
                    ]}
                    style={{ flex: 1, marginBottom: 0, width: '100%' }}>
                    <StyledInput
                      autoComplete="off"
                      placeholder={
                        currentType === 'email'
                          ? t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderEmail')
                          : t('dashboard.events.addEditEvent.tickets.placeHolderLinks')
                      }
                      data-cy="input-ticket-registration-link"
                    />
                  </Form.Item>

                  <Col
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignContent: 'center',
                      position: 'absolute',
                      top: '8px',
                      right: '11px',
                    }}
                    span={2}>
                    {!isOnlyField && (
                      <CloseOutlined
                        style={{ color: '#1B3DE6', fontSize: '16px' }}
                        onClick={() => remove(fieldName)}
                        data-cy={`icon-close-${mappedField}-${key}`}
                      />
                    )}
                  </Col>
                </Space.Compact>

                <Form.Item name={[fieldName, 'name']} style={{ marginBottom: 0, width: '100%' }}>
                  <CreateMultiLingualFormItems
                    calendarContentLanguage={calendarContentLanguage}
                    form={form}
                    name={[fieldName, 'name']}
                    entityId={entityId}
                    validations={validations && validations.trim() !== '' ? validations : ''}
                    dataCy={`input-text-area-description-${index}`}
                    placeholder={placeHolderCollectionCreator({
                      t,
                      calendarContentLanguage,
                      hasCommonPlaceHolder: true,
                      placeholderBase: t('dashboard.organization.createNew.addOrganization.addLinkText'),
                    })}
                    required={false}>
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
                </Form.Item>
              </Row>
            );
          })}

          <Form.Item>
            <Outlined
              size="large"
              label={t('dashboard.organization.createNew.addOrganization.addSocialMediaLinks')}
              onClick={() => add({ type: 'url', value: '', name: {} })}
              data-cy={`button-add-${mappedField}`}
            />
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};

export default AdditionalLinks;
