import { Card, Checkbox, Col, Dropdown, Form, Input, Row, Typography } from 'antd';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createSearchParams, useLocation, useOutletContext, useSearchParams } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';
import BilingualInput from '../../../components/BilingualInput';
import BreadCrumbButton from '../../../components/Button/BreadCrumb/BreadCrumbButton';
import { contentLanguage } from '../../../constants/contentLanguage';
import PrimaryButton from '../../../components/Button/Primary';
import ContentLanguageInput from '../../../components/ContentLanguageInput';
import './addTaxonomy.css';
import { taxonomyClassTranslations } from '../../../constants/taxonomyClass';
import { userRolesWithTranslation } from '../../../constants/userRoles';
import SearchableCheckbox from '../../../components/Filter/SearchableCheckbox';

const AddTaxonomy = () => {
  const { TextArea } = Input;

  let [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const taxonomyId = searchParams.get('id');
  const { t } = useTranslation();
  const [currentCalendarData] = useOutletContext();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const eventData = {};

  useEffect(() => {
    if (location.state?.data) {
      setSearchParams(createSearchParams({ id: location.state.data.id }));
    }
  }, []);

  const saveTaxonomyHandler = (e) => {
    console.log('clicked save', e);
  };

  const setClassValue = ({ selectedKeys }) => {
    console.log(selectedKeys);
  };

  return (
    <Form layout="vertical">
      <Row className="add-taxonomy-wrapper">
        <Col span={24}>
          <Row justify="space-between">
            <Col>
              <BreadCrumbButton />
              <div className="add-Taxonomy-heading">
                <h4>{taxonomyId ? t('dashboard.taxonomy.addNew.heading') : t('dashboard.taxonomy.addNew.heading')}</h4>
              </div>
            </Col>
            <Col>
              <div className="add-event-button-wrap">
                <Form.Item>
                  <PrimaryButton
                    label={t('dashboard.taxonomy.addNew.save')}
                    onClick={(e) => saveTaxonomyHandler(e)}
                    // disabled={updateEventLoading || addEventLoading || addImageLoading ? true : false}
                  />
                </Form.Item>
              </div>
            </Col>
          </Row>
        </Col>
        <Col flex="736px">
          <div className="taxonomy-information-card">
            <Card bordered={false}>
              <div>
                <Row>
                  <Col flex="423px">
                    <Form.Item label={t('dashboard.taxonomy.addNew.class')} className="classType">
                      <Dropdown
                        overlayClassName="add-user-form-field-dropdown-wrapper"
                        getPopupContainer={(trigger) => trigger.parentNode}
                        overlayStyle={{ minWidth: '100%' }}
                        menu={{
                          items: taxonomyClassTranslations,
                          selectable: true,
                          onSelect: ({ selectedKeys }) => {
                            setClassValue(selectedKeys);
                          },
                        }}
                        trigger={['click']}>
                        <div>
                          <Typography.Text>
                            {eventData?.userType
                              ? eventData?.userType
                              : t('dashboard.taxonomy.selectType.classPlaceHolder')}
                          </Typography.Text>
                          <DownOutlined style={{ fontSize: '16px' }} />
                        </div>
                      </Dropdown>
                      <span className="field-description">{t(`dashboard.taxonomy.addNew.destinationHeading`)}</span>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col flex="423px">
                    <Form.Item label={t('dashboard.taxonomy.addNew.mapToField')} className="classType">
                      <Dropdown
                        overlayClassName="add-user-form-field-dropdown-wrapper"
                        getPopupContainer={(trigger) => trigger.parentNode}
                        overlayStyle={{ minWidth: '100%' }}
                        menu={{
                          items: taxonomyClassTranslations,
                          selectable: true,
                          onSelect: ({ selectedKeys }) => {
                            setClassValue(selectedKeys);
                          },
                        }}
                        trigger={['click']}>
                        <div>
                          <Typography.Text>
                            {eventData?.userType
                              ? eventData?.userType
                              : t('dashboard.taxonomy.selectType.classPlaceHolder')}
                          </Typography.Text>
                          <DownOutlined style={{ fontSize: '16px' }} />
                        </div>
                      </Dropdown>
                      <span className="field-description">{t(`dashboard.taxonomy.addNew.mapToFieldDescription`)}</span>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col flex="423px">
                    <Form.Item label={t('dashboard.taxonomy.addNew.name')}>
                      <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                        <BilingualInput fieldData={eventData?.name}>
                          <Form.Item
                            name="french"
                            key={contentLanguage.FRENCH}
                            dependencies={['english']}
                            rules={[
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (value || getFieldValue('english')) {
                                    return Promise.resolve();
                                  } else return Promise.reject(new Error(t('dashboard.taxonomy.addNew.')));
                                },
                              }),
                            ]}>
                            <TextArea
                              autoSize
                              autoComplete="off"
                              placeholder={t('dashboard.taxonomy.addNew.frNamePlaceHolder')}
                              style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                              size="large"
                            />
                          </Form.Item>
                          <Form.Item
                            name="english"
                            key={contentLanguage.ENGLISH}
                            dependencies={['french']}
                            rules={[
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (value || getFieldValue('french')) {
                                    return Promise.resolve();
                                  } else return Promise.reject(new Error(t('dashboard.taxonomy.addNew.')));
                                },
                              }),
                            ]}>
                            <TextArea
                              autoSize
                              autoComplete="off"
                              placeholder={t('dashboard.taxonomy.addNew.enNamePlaceHolder')}
                              style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                              size="large"
                            />
                          </Form.Item>
                        </BilingualInput>
                      </ContentLanguageInput>
                      <span className="field-description">{t(`dashboard.taxonomy.addNew.nameDescription`)}</span>
                      <Form.Item name="useTaxonomyName" valuePropName="checked">
                        <Checkbox className="name-checkbox">{t(`dashboard.taxonomy.addNew.nameCheckbox`)}</Checkbox>
                      </Form.Item>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col flex="423px">
                    <Form.Item label={t('dashboard.taxonomy.addNew.description')}>
                      <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                        <BilingualInput fieldData={eventData?.name}>
                          <Form.Item
                            name="french"
                            key={contentLanguage.FRENCH}
                            dependencies={['english']}
                            rules={[
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (value || getFieldValue('english')) {
                                    return Promise.resolve();
                                  } else return Promise.reject(new Error(t('dashboard.taxonomy.addNew.')));
                                },
                              }),
                            ]}>
                            <TextArea
                              autoSize
                              autoComplete="off"
                              placeholder={t('dashboard.taxonomy.addNew.frDescriptionPlaceHolder')}
                              style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                              size="large"
                            />
                          </Form.Item>
                          <Form.Item
                            name="english"
                            key={contentLanguage.ENGLISH}
                            dependencies={['french']}
                            rules={[
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (value || getFieldValue('french')) {
                                    return Promise.resolve();
                                  } else return Promise.reject(new Error(t('dashboard.taxonomy.addNew.')));
                                },
                              }),
                            ]}>
                            <TextArea
                              autoSize
                              autoComplete="off"
                              placeholder={t('dashboard.taxonomy.addNew.enDescriptionPlaceHolder')}
                              style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                              size="large"
                            />
                          </Form.Item>
                        </BilingualInput>
                      </ContentLanguageInput>
                      <span className="field-description">{t(`dashboard.taxonomy.addNew.descriptionExplation`)}</span>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col flex="423px">
                    <Form.Item label={t('dashboard.taxonomy.addNew.userAccess')} className="user-access">
                      <SearchableCheckbox
                        onFilterChange={(values) => {
                          console.log(values);
                        }}
                        data={[
                          {
                            key: userRolesWithTranslation[0].key,
                            label: (
                              <Checkbox
                                value={userRolesWithTranslation[0].label}
                                key={userRolesWithTranslation[0].key}
                                style={{ marginLeft: '8px' }}>
                                {userRolesWithTranslation[0].label}
                              </Checkbox>
                            ),
                          },
                        ]}
                        overlayStyle={{ minWidth: '100%' }}
                        value={[userRolesWithTranslation[0].label]}>
                        {eventData?.userType
                          ? eventData?.userType
                          : t('dashboard.taxonomy.addNew.userAccessPlaceHolder')}
                        <DownOutlined style={{ fontSize: '16px' }} />
                      </SearchableCheckbox>
                      <div className="field-description" style={{ marginTop: 8 }}>
                        {t(`dashboard.taxonomy.addNew.userAccessDescription`)}
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default AddTaxonomy;
