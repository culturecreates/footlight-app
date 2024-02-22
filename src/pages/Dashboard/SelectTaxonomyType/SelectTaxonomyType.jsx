import { Button, Card, Col, Dropdown, Form, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LeftOutlined, DownOutlined, PlusOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import './selectTaxonomyType.css';
import { taxonomyClassTranslations } from '../../../constants/taxonomyClass';
import DateAction from '../../../components/Button/DateAction/DateAction';
import { standardFieldsForTaxonomy } from '../../../utils/standardFields';
import { PathName } from '../../../constants/pathName';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { setErrorStates } from '../../../redux/reducer/ErrorSlice';
import { userRoles } from '../../../constants/userRoles';

const SelectTaxonomyType = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formInstance] = Form.useForm();
  const { calendarId } = useParams();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
    isReadOnly,
  ] = useOutletContext();
  setContentBackgroundColor('#F9FAFF');
  const { user } = useSelector(getUserDetails);
  const dispatch = useDispatch();

  const [selectedClass, setSelectedClass] = useState({ key: '', label: '' });
  const [standardFields, setStandardFields] = useState([]);

  const buttonStyles = {
    border: '1px solid var(--content-neutral-secondary, #646D7B)',
    background: 'var(--background-neutrals-underground-0, #F7F7F7)',
    opacity: 0.5,
  };

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  const adminCheckHandler = () => {
    return calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin;
  };

  useEffect(() => {
    if (user && calendar.length > 0) {
      !adminCheckHandler() && dispatch(setErrorStates({ errorCode: '403', isError: true, message: 'Not Authorized' }));
    }
  }, [user, calendar]);

  const onSaveHandler = () => {
    console.log('clicked field option');
  };

  const navigationHandler = (dynamic) => {
    formInstance.validateFields(['classType']).then(() => {
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Taxonomies}${PathName.AddTaxonomy}`, {
        state: { selectedClass: selectedClass.key, dynamic: dynamic },
      });
    });
  };

  const setTaxonomyClass = ({ value, fieldType }) => {
    const selectedLabel = taxonomyClassTranslations.filter((item) => item.key === value);
    setSelectedClass({ key: selectedLabel[0].key, label: selectedLabel[0].label });
    setStandardFields(standardFieldsForTaxonomy(selectedLabel[0].key, currentCalendarData?.fieldTaxonomyMaps));
    formInstance.setFieldsValue({ [fieldType]: value });
  };

  useEffect(() => {
    if (isReadOnly) {
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Taxonomies}`, { replace: true });
    }
  }, [isReadOnly]);

  return (
    <div className="select-taxonomy-type-wrapper">
      <Row>
        <Col span={24}>
          <div className="button-container">
            <Button type="link" onClick={() => navigate(-1)} data-cy="button-taxonomy-back-to-previous">
              <LeftOutlined style={{ fontSize: '12px', paddingRight: '5px' }} />
              {t('dashboard.organization.createNew.search.breadcrumb')}
            </Button>
          </div>
          <h4 className="heading" data-cy="span-taxonomy-select-type-heading">
            {t('dashboard.taxonomy.selectType.heading')}
          </h4>
        </Col>
      </Row>
      <Row>
        <Col flex="736px">
          <Card
            style={{
              height: 368,
              borderRadius: 4,
              background: 'var(--background-neutrals-ground, #FFF)',
              border: 'none',
            }}>
            <Form name="selectTaxonomyType" form={formInstance} onFinish={onSaveHandler} layout="vertical">
              <Row className="classType">
                <Col flex="423px">
                  <Form.Item
                    data-cy="form-item-class-title"
                    name="classType"
                    required
                    label={t('dashboard.taxonomy.selectType.class')}
                    style={{ marginBottom: '4px' }}
                    rules={[
                      {
                        required: true,
                        message: t('dashboard.taxonomy.selectType.classValidation'),
                      },
                    ]}>
                    <Dropdown
                      data-cy="dropdown-concept-class"
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
                        <Typography.Text data-cy="typography-taxonomy-class">
                          {selectedClass.label || t('dashboard.taxonomy.selectType.classPlaceHolder')}
                        </Typography.Text>
                        <DownOutlined style={{ fontSize: '16px' }} />
                      </div>
                    </Dropdown>
                  </Form.Item>
                  <span className="destination-discription" data-cy="span-taxonomy-select-class-helper-text">
                    {t('dashboard.taxonomy.selectType.destinationHeading')}
                  </span>
                </Col>
              </Row>
              <Row style={{ marginTop: 24 }}>
                <Col>
                  <Form.Item
                    data-cy="form-item-taxonomy-select-type"
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
                        <span className="destination-discription" data-cy="span-taxonomy-select-type-helper-text">
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
                          onClick={() => navigationHandler('not-dynamic')}
                        />
                      </Col>
                      <Col>
                        <DateAction
                          data-cy="button-taxonomy-existing-field"
                          iconrender={<DatabaseOutlined style={{ fontSize: '24px' }} />}
                          label={t('dashboard.taxonomy.selectType.existingField')}
                          disabled={standardFields.length < 1 && selectedClass.label !== '' ? true : false}
                          style={{
                            width: '203.5px',
                            height: '104px',
                            padding: 16,
                            ...(standardFields.length < 1 && selectedClass.label !== '' && buttonStyles),
                          }}
                          onClick={() => navigationHandler('dynamic')}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col flex="423px">
                        <span className="info-message" data-cy="span-info-message">
                          {standardFields.length < 1 &&
                            selectedClass.label != '' &&
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
