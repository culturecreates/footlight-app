import { Button, Col, Form, Grid, Input, message, Row, Typography } from 'antd';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import CreateMultiLingualFormItems from '../../../../layout/CreateMultiLingualFormItems';
import { placeHolderCollectionCreator } from '../../../../utils/MultiLingualFormItemSupportFunctions';
import MultiLingualTextEditor from '../../../../components/MultilingualTextEditor/MultiLingualTextEditor';
import CardEvent from '../../../../components/Card/Common/Event';
import PrimaryButton from '../../../../components/Button/Primary';
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCreateNotificationMutation } from '../../../../services/notification';
import { messageTypeMap } from '../../../../constants/notificationConstants';
import { interfaceLanguage } from '../../../../constants/contentLanguage';
import { PathName } from '../../../../constants/pathName';
import { getUserDetails } from '../../../../redux/reducer/userSlice';
import { useSelector } from 'react-redux';

const { Title } = Typography;
const { useBreakpoint } = Grid;
const { TextArea } = Input;

const CreateSystemUpdate = () => {
  const { calendarId } = useParams();
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const [
    // eslint-disable-next-line no-unused-vars
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
  ] = useOutletContext();
  const { user } = useSelector(getUserDetails);

  const paddingValue = screens.md ? '24px 8px' : '16px 0px';

  useEffect(() => {
    setContentBackgroundColor('#F9FAFF');
  }, [setContentBackgroundColor]);
  const calendarContentLanguage = Object.values(interfaceLanguage);

  const [createNotification] = useCreateNotificationMutation();

  const addSystemUpdate = () => {
    form
      .validateFields()
      .then(async () => {
        const { messageHeading, messageDescription } = form.getFieldsValue(true);

        let notificationData = {
          messageHeading,
          messageDescription,
          messageTime: new Date().toISOString(),
          messageType: messageTypeMap.SYSTEM,
        };
        const response = await createNotification({ calendarId, notificationData });

        if (response?.data?.statusCode == 201) {
          message.success({
            duration: 10,
            maxCount: 1,
            key: 'event-review-publish-success',
            content: t('notification.systemUpdates.messages.create'),
          });
          navigate(-1);
        } else {
          message.error({
            duration: 10,
            maxCount: 1,
            key: 'event-review-publish-error',
            content: t('notification.systemUpdates.error'),
          });
        }
      })
      .catch((error) => {
        console.error('Validation failed:', error);
        message.warning({
          duration: 10,
          maxCount: 1,
          key: 'event-review-publish-warning',
          content: (
            <>
              {t('notification.systemUpdates.validation.description')}
              &nbsp;
              <Button
                type="text"
                data-cy="button-close-review-publish-warning"
                icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
                onClick={() => message.destroy('event-review-publish-warning')}
              />
            </>
          ),
          icon: <ExclamationCircleOutlined />,
        });
      });
  };

  if (!user?.isSuperAdmin) navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);

  return (
    <div className="system-updates-container" style={{ padding: paddingValue }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Title level={2} className="system-updates-title" style={{ marginBottom: '32px' }}>
          {t('notification.systemUpdates.title')}
        </Title>
        <PrimaryButton
          label={t('notification.systemUpdates.save')}
          onClick={addSystemUpdate}
          data-cy="button-save-event"
        />
      </div>
      <Form form={form} layout="vertical" className="system-update-form">
        <Row className="updates-list">
          <Col span={24} flex="748px">
            <CardEvent marginTop="5%" marginResponsive="0px">
              <div style={{ padding: '32px 0px' }}>
                <Form.Item label={t('notification.systemUpdates.labels.title')}>
                  <CreateMultiLingualFormItems
                    calendarContentLanguage={calendarContentLanguage}
                    form={form}
                    name={['messageHeading']}
                    data={{}}
                    validations={t('dashboard.events.addEditEvent.validations.title')}
                    dataCy={`text-area-system-update-title-`}
                    placeholder={placeHolderCollectionCreator({
                      t,
                      calendarContentLanguage,
                      placeholderBase: 'notification.systemUpdates.placeholders.title',
                    })}
                    required={false}>
                    <TextArea
                      autoSize
                      autoComplete="off"
                      style={{
                        borderRadius: '4px',
                        border: `${calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
                      }}
                      size="large"
                    />
                  </CreateMultiLingualFormItems>
                </Form.Item>
                <Form.Item label={t('notification.systemUpdates.labels.description')}>
                  <MultiLingualTextEditor
                    data={{}}
                    form={form}
                    calendarContentLanguage={calendarContentLanguage}
                    name={'messageDescription'}
                    required={true}
                    placeholder={placeHolderCollectionCreator({
                      calendarContentLanguage,
                      t,
                      placeholderBase: 'notification.systemUpdates.placeholders.description',
                    })}
                  />
                </Form.Item>
              </div>
            </CardEvent>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateSystemUpdate;
