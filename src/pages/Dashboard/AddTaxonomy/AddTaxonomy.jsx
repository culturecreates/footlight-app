import { Card, Checkbox, Col, Dropdown, Form, Input, Row, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createSearchParams, useLocation, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
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
import DraggableTree from '../../../components/DraggableTree/DraggableTree';
import { useLazyGetTaxonomyQuery } from '../../../services/taxonomy';

const AddTaxonomy = () => {
  const { TextArea } = Input;

  const { calendarId } = useParams();
  let [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const taxonomyId = searchParams.get('id');
  const { t } = useTranslation();
  const [currentCalendarData] = useOutletContext();
  const timestampRef = useRef(Date.now()).current;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const eventData = {};

  const [taxonomyData, setTaxonomyData] = useState([]);

  const [getTaxonomy, { isLoading: loading }] = useLazyGetTaxonomyQuery({
    sessionId: timestampRef,
  });

  useEffect(() => {
    if (location.state?.data) {
      setSearchParams(createSearchParams({ id: location.state.data.id }));
    }
  }, []);

  useEffect(() => {
    if (taxonomyId) {
      getTaxonomy({ id: taxonomyId, includeConcepts: true, calendarId })
        .unwrap()
        .then((res) => {
          setTaxonomyData(res);
        });
    }
  }, [taxonomyId]);

  const saveTaxonomyHandler = (e) => {
    console.log('clicked save', e);
  };

  const setClassValue = ({ selectedKeys }) => {
    console.log(selectedKeys);
  };

  return (
    <>
      {!loading && (
        <Form layout="vertical">
          <Row className="add-taxonomy-wrapper">
            <Col span={24}>
              <Row justify="space-between">
                <Col>
                  <BreadCrumbButton />
                  <div className="add-Taxonomy-heading">
                    <h4>
                      {taxonomyId ? t('dashboard.taxonomy.addNew.heading') : t('dashboard.taxonomy.addNew.heading')}
                    </h4>
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
                          <span className="field-description">
                            {t(`dashboard.taxonomy.addNew.mapToFieldDescription`)}
                          </span>
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
                          <span className="field-description">
                            {t(`dashboard.taxonomy.addNew.descriptionExplation`)}
                          </span>
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
            <Col flex="736px" style={{ marginTop: '32px' }} className="concept-card">
              <Card bordered={false}>
                <Row justify="space-between">
                  <Col flex="423px">
                    <Row gutter={[24, 24]}>
                      <Col className="heading-concepts">{t('dashboard.taxonomy.addNew.concepts.heading')}</Col>
                      <Col className="text-concepts">{t('dashboard.taxonomy.addNew.concepts.description')}</Col>
                      <Col flex="423px" style={{ display: 'flex' }}>
                        <DraggableTree data={taxonomyData} />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Form>
      )}
    </>
  );
};

export default AddTaxonomy;