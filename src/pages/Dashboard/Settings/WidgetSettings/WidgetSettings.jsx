import { Col, Divider, Form, Row } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './widgetSettings.css';
import Outlined from '../../../../components/Button/Outlined';
import StyledInput from '../../../../components/Input/Common';
import ColorPicker from '../../../../components/ColorPicker/ColorPicker';
// import { placeTaxonomyMappedFieldTypes } from '../../../../constants/placeMappedFieldTypes';
// import TreeSelectOption from '../../../../components/TreeSelectOption';
// import { CloseCircleOutlined } from '@ant-design/icons';
// import NoContent from '../../../../components/NoContent/NoContent';

const WidgetSettings = () => {
  const { t } = useTranslation();

  const [color, setColor] = useState('#aabbcc');

  const localePath = 'dashboard.settings.widgetSettings';
  return (
    <Row className="widget-settings" justify="space-between">
      <Col className="widget-settings-wrapper" flex={'900px'}>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} justify="space-between" style={{ margin: 0 }}>
          <Col flex={'448px'} style={{ paddingLeft: '0px' }}>
            <div className="configure-section-wrapper">
              <h4 className="heading" data-cy="widget-settings-title">
                {t(`${localePath}.title`)}
              </h4>
              <p className="page-description" data-cy="widget-settings-page-description">
                {t(`${localePath}.pageDescription`)}
              </p>
              <Form layout="vertical" className="widget-settings-form" data-cy="widget-settings-form">
                <Row gutter={[32, 4]} className="form-item-container">
                  <Col flex="448px">
                    <Form.Item
                      name="limit"
                      label={t(`${localePath}.limit`)}
                      rules={[
                        {
                          type: 'limit',
                          message: 'need to be added',
                          // message: t('dashboard.events.addEditEvent.validations.url'),
                        },
                      ]}
                      data-cy="widget-settings-limit">
                      <StyledInput />
                    </Form.Item>
                  </Col>
                  <Col flex="448px" className="color-select-wrapper">
                    <Form.Item
                      name="limit"
                      label={t(`${localePath}.color`)}
                      rules={[
                        {
                          type: 'limit',
                          message: 'need to be added',
                          // message: t('dashboard.events.addEditEvent.validations.url'),
                        },
                      ]}
                      data-cy="widget-settings-limit">
                      <StyledInput
                        addonBefore={<ColorPicker color={color} setColor={setColor} />}
                        placeholder={t(`${localePath}.colorPlaceHolder`)}
                      />
                      <p className="page-description" data-cy="widget-settings-page-description">
                        {t(`${localePath}.colorDescreption`)}
                      </p>
                    </Form.Item>
                  </Col>
                  <Col flex="448px">
                    <Row gutter={[8, 8]}>
                      <Col flex="209px">
                        <Form.Item
                          name="limit"
                          label={t(`${localePath}.height`)}
                          rules={[
                            {
                              type: 'limit',
                              message: 'need to be added',
                              // message: t('dashboard.events.addEditEvent.validations.url'),
                            },
                          ]}
                          data-cy="widget-settings-limit">
                          <StyledInput />
                        </Form.Item>
                      </Col>

                      <Col flex="209px">
                        <Form.Item
                          name="limit"
                          label={t(`${localePath}.width`)}
                          rules={[
                            {
                              type: 'limit',
                              message: 'need to be added',
                              // message: t('dashboard.events.addEditEvent.validations.url'),
                            },
                          ]}
                          data-cy="widget-settings-limit">
                          <StyledInput />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Divider />

                  {/* <Form.Item data-cy="form-item-place-region">
                    <TreeSelectOption
                      data-cy="treeselect-place-region"
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
                            data-cy={`tag-place-${label}`}
                            closable={closable}
                            onClose={onClose}
                            closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                            {label}
                          </Tags>
                        );
                      }}
                    />
                  </Form.Item> */}
                </Row>
              </Form>
            </div>
          </Col>
          <Col flex={'253px'}>
            <div className="preview-section-wrapper">
              <Outlined size="large" label={t(`${localePath}.preview`)} data-cy="button-save-event" />
              <ColorPicker color={color} setColor={setColor} />
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default WidgetSettings;
