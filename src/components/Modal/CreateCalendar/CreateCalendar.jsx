import React from 'react';
import { Form, Input, notification, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { CloseCircleOutlined } from '@ant-design/icons';
import CustomModal from '../Common/CustomModal';
import { useAddCalendarMutation } from '../../../services/calendar';
import { calendarLanguages, contentLanguageKeyMap } from '../../../constants/contentLanguage';
import { timeZones, dateFormats } from '../../../constants/calendarSettingsForm';
import Select from '../../Select';
import TreeSelectOption from '../../TreeSelectOption';
import Tags from '../../Tags/Common/Tags';
import NoContent from '../../NoContent/NoContent';
import StyledInput from '../../Input/Common';
import CreateMultiLingualFormItems from '../../../layout/CreateMultiLingualFormItems/CreateMultiLingualFormItems';
import { setSelectedCalendar } from '../../../redux/reducer/selectedCalendarSlice';
import { setRecentCalendarForUser } from '../../../utils/recentCalendarStorage';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { PathName } from '../../../constants/pathName';
import './createCalendar.css';

function CreateCalendar({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(getUserDetails);
  const [form] = Form.useForm();
  const [addCalendar, { isLoading }] = useAddCalendarMutation();

  const contentLanguage = Form.useWatch('contentLanguage', form);
  const namePlaceholder = t('dashboard.calendar.createCalendar.namePlaceholder');
  const namePlaceholderMap =
    contentLanguage && contentLanguage.length > 0
      ? Object.fromEntries(contentLanguage.map((lang) => [contentLanguageKeyMap[lang], namePlaceholder]))
      : namePlaceholder;

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();

      const dto = {
        name: values.name,
        contentLanguage: values.contentLanguage,
      };

      if (values.contact) dto.contact = values.contact;
      if (values.timezone) dto.timezone = values.timezone;
      if (values.dateFormatDisplay) dto.dateFormatDisplay = values.dateFormatDisplay;

      if (values.eventTemplate || values.searchResultTemplate) {
        dto.widgetSettings = {};
        if (values.eventTemplate) dto.widgetSettings.eventDetailsUrlTemplate = values.eventTemplate;
        if (values.searchResultTemplate) dto.widgetSettings.listEventsUrlTemplate = values.searchResultTemplate;
      }

      const response = await addCalendar({ data: dto }).unwrap();
      const id = response?.id ?? response?.data?.id;

      notification.success({
        description: t('dashboard.calendar.createCalendar.success'),
        placement: 'top',
        closeIcon: <></>,
        maxCount: 1,
        duration: 3,
      });

      form.resetFields();
      setOpen(false);

      if (id) {
        dispatch(setSelectedCalendar(String(id)));
        setRecentCalendarForUser({ user, calendarId: id });
        sessionStorage.clear();
        sessionStorage.setItem('calendarId', String(id));
        const origin = window.location.origin;
        const newUrl = `${origin}${PathName.Dashboard}/${id}${PathName.Events}`;
        window.location.href = newUrl;
      }
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      const status = error?.status;
      if (status === 409) {
        message.warning(t('dashboard.calendar.createCalendar.duplicate'));
      } else if (status) {
        const serverMsg = error?.data?.message || error?.data?.error;
        if (serverMsg) message.warning(serverMsg);
      }
    }
  };

  return (
    <CustomModal
      open={open}
      onCancel={handleCancel}
      centered
      width={600}
      title={<span className="create-calendar-modal-title">{t('dashboard.calendar.createCalendar.modalTitle')}</span>}
      destroyOnClose
      footer={null}
      wrapClassName="create-calendar-modal-wrapper"
      className="create-calendar-modal">
      <Form form={form} layout="vertical" preserve={false} className="create-calendar-form">
        <Form.Item
          name="contentLanguage"
          label={
            <span className="create-calendar-label">{t('dashboard.calendar.createCalendar.contentLanguage')}</span>
          }
          rules={[{ required: true, message: t('common.validations.informationRequired') }]}
          data-cy="form-item-create-calendar-content-language">
          <TreeSelectOption
            showSearch={false}
            allowClear
            treeDefaultExpandAll
            multiple
            placeholder={t('dashboard.settings.calendarSettings.placeholders.calendarLanguage')}
            notFoundContent={<NoContent />}
            clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
            treeData={calendarLanguages}
            data-cy="treeselect-create-calendar-language"
            tagRender={(props) => {
              const { closable, onClose, label } = props;
              return (
                <Tags
                  data-cy={`tag-create-calendar-language-${label}`}
                  closable={closable}
                  onClose={onClose}
                  closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                  {label}
                </Tags>
              );
            }}
          />
        </Form.Item>

        {contentLanguage && contentLanguage.length > 0 ? (
          <CreateMultiLingualFormItems
            calendarContentLanguage={contentLanguage}
            form={form}
            name="name"
            data={{}}
            validations={t('common.validations.informationRequired')}
            required={true}
            placeholder={namePlaceholderMap}
            data-cy="input-create-calendar-name">
            <StyledInput data-cy="input-create-calendar-name-input" />
          </CreateMultiLingualFormItems>
        ) : (
          <Form.Item
            label={<span className="create-calendar-label">{t('dashboard.calendar.createCalendar.name')}</span>}
            required>
            <Input disabled placeholder={t('dashboard.calendar.createCalendar.namePlaceholderWhenNoLanguage')} />
          </Form.Item>
        )}

        <Form.Item
          name="contact"
          label={t('dashboard.calendar.createCalendar.contact')}
          rules={[{ type: 'email', message: t('login.validations.invalidEmail') }]}
          data-cy="form-item-create-calendar-contact">
          <StyledInput
            placeholder={t('dashboard.settings.calendarSettings.placeholders.contact')}
            data-cy="input-create-calendar-contact"
          />
        </Form.Item>

        <Form.Item
          name="timezone"
          label={t('dashboard.calendar.createCalendar.timezone')}
          data-cy="form-item-create-calendar-timezone">
          <Select
            options={timeZones}
            placeholder={t('dashboard.settings.calendarSettings.placeholders.timezone')}
            data-cy="select-create-calendar-timezone"
          />
        </Form.Item>

        <Form.Item
          name="dateFormatDisplay"
          label={t('dashboard.calendar.createCalendar.dateFormat')}
          data-cy="form-item-create-calendar-date-format">
          <Select
            options={dateFormats}
            placeholder={t('dashboard.settings.calendarSettings.placeholders.dateFormatDisplay')}
            data-cy="select-create-calendar-date-format"
          />
        </Form.Item>

        <Form.Item
          name="eventTemplate"
          label={t('dashboard.calendar.createCalendar.eventTemplate')}
          rules={[{ type: 'url', message: t('dashboard.events.addEditEvent.validations.url') }]}
          extra={
            <span className="create-calendar-help">
              {t('dashboard.settings.calendarSettings.eventTemplateDescription')}
            </span>
          }
          data-cy="form-item-create-calendar-event-template">
          <StyledInput
            addonBefore="URL"
            autoComplete="off"
            placeholder={t('dashboard.settings.calendarSettings.placeholders.eventTemplate')}
            data-cy="input-create-calendar-event-template"
          />
        </Form.Item>

        <Form.Item
          name="searchResultTemplate"
          label={t('dashboard.calendar.createCalendar.searchResultTemplate')}
          rules={[{ type: 'url', message: t('dashboard.events.addEditEvent.validations.url') }]}
          extra={
            <span className="create-calendar-help">
              {t('dashboard.settings.calendarSettings.searchResultTemplateDescription')}
            </span>
          }
          data-cy="form-item-create-calendar-search-result-template">
          <StyledInput
            addonBefore="URL"
            autoComplete="off"
            placeholder={t('dashboard.settings.calendarSettings.placeholders.searchResultTemplate')}
            data-cy="input-create-calendar-search-result-template"
          />
        </Form.Item>

        <div className="create-calendar-footer">
          <a onClick={handleCancel} className="create-calendar-cancel">
            {t('dashboard.calendar.createCalendar.cancel')}
          </a>
          <button
            type="button"
            className="create-calendar-submit-btn"
            onClick={handleFinish}
            disabled={isLoading}
            data-cy="button-create-calendar-submit">
            {isLoading ? t('Creating...') || 'Creating...' : t('dashboard.calendar.createCalendar.create')}
          </button>
        </div>
      </Form>
    </CustomModal>
  );
}

export default CreateCalendar;
