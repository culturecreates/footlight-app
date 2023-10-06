import { Button, Card, Col, Dropdown, Form, Row, Typography } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LeftOutlined, DownOutlined, PlusOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './selectTaxonomyType.css';
import { taxonomyClassTranslations } from '../../../constants/taxonomyClass';
import DateAction from '../../../components/Button/DateAction/DateAction';
import { standardFieldsForTaxonomy } from '../../../utils/standardFields';

const SelectTaxonomyType = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formInstance] = Form.useForm();

  const [selectedClass, setSelectedClass] = useState('');
  const [standardFields, setStandardFields] = useState([]);

  const buttonStyles = {
    border: '1px solid var(--content-neutral-secondary, #646D7B)',
    background: 'var(--background-neutrals-underground-0, #F7F7F7)',
    opacity: 0.5,
  };

  const onSaveHandler = () => {
    console.log('clicked field option');
  };

  const setTaxonomyClass = ({ value, fieldType }) => {
    const selectedLabel = taxonomyClassTranslations.filter((item) => item.key === value);
    setSelectedClass(selectedLabel[0].label);
    setStandardFields(standardFieldsForTaxonomy(selectedLabel[0].key));
    formInstance.setFieldsValue({ [fieldType]: value });
  };

  return (
    <div className="select-taxonomy-type-wrapper">
      <Row>
        <Col span={24}>
          <div className="button-container">
            <Button type="link" onClick={() => navigate(-1)}>
              <LeftOutlined style={{ fontSize: '12px', paddingRight: '5px' }} />
              {t('dashboard.organization.createNew.search.breadcrumb')}
            </Button>
          </div>
          <h4 className="heading">{t('dashboard.taxonomy.selectType.heading')}</h4>
        </Col>
      </Row>
      <Row>
        <Col flex="736px">
          <Card style={{ height: 368, borderRadius: 4, background: 'var(--background-neutrals-ground, #FFF)' }}>
            <Form name="selectTaxonomyType" form={formInstance} onFinish={onSaveHandler} layout="vertical">
              <Row className="classType">
                <Col flex="423px">
                  <Form.Item
                    name="classType"
                    required
                    label={t('dashboard.taxonomy.selectType.class')}
                    style={{ marginBottom: '4px' }}
                    rules={[
                      {
                        required: true,
                        message: 'Please select a value for Class Type',
                      },
                    ]}>
                    <Dropdown
                      getPopupContainer={(trigger) => trigger.parentNode}
                      overlayStyle={{ minWidth: '100%' }}
                      menu={{
                        items: taxonomyClassTranslations,
                        selectable: true,
                        onSelect: ({ selectedKeys }) => {
                          setTaxonomyClass({ value: selectedKeys[0], fieldType: 'classType' });
                        },
                      }}
                      trigger={['click']}>
                      <div>
                        <Typography.Text>
                          {selectedClass || t('dashboard.taxonomy.selectType.classPlaceHolder')}
                        </Typography.Text>
                        <DownOutlined style={{ fontSize: '16px' }} />
                      </div>
                    </Dropdown>
                  </Form.Item>
                  <span className="destination-discription">
                    {t('dashboard.taxonomy.selectType.destinationHeading')}
                  </span>
                </Col>
              </Row>
              <Row style={{ marginTop: 24 }}>
                <Col>
                  <Form.Item
                    name="inputType"
                    required
                    label={t('dashboard.taxonomy.selectType.inputType')}
                    style={{ marginBottom: '4px' }}
                    rules={[
                      {
                        required: true,
                        message: 'Please select a value for Class Type',
                      },
                    ]}>
                    <Row>
                      <Col>
                        <span className="destination-discription">
                          {t('dashboard.taxonomy.selectType.inputTypeDescription')}
                        </span>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: 8 }}>
                      <Col>
                        <DateAction
                          iconrender={<PlusOutlined style={{ fontSize: '24px' }} />}
                          label={t('dashboard.taxonomy.selectType.newField')}
                          style={{ width: '203.5px', height: '104px', padding: 16 }}
                          //   onClick={() => setDateType(dateTypes.SINGLE)}
                        />
                      </Col>
                      <Col>
                        <DateAction
                          iconrender={<DatabaseOutlined style={{ fontSize: '24px' }} />}
                          label={t('dashboard.taxonomy.selectType.existingField')}
                          disabled={standardFields.length < 1 && selectedClass !== '' ? true : false}
                          style={{
                            width: '203.5px',
                            height: '104px',
                            padding: 16,
                            ...(standardFields.length < 1 && selectedClass !== '' && buttonStyles),
                          }}
                          //   onClick={() => setDateType(dateTypes.SINGLE)}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col flex="423px">
                        <span className="info-message">
                          {standardFields.length < 1 &&
                            selectedClass != '' &&
                            t('dashboard.taxonomy.selectType.noFieldAvailable')}
                        </span>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SelectTaxonomyType;
