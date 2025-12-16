import React, { useState, useMemo } from 'react';
import { Form, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { LoadingOutlined } from '@ant-design/icons';
import CustomModal from '../Modal/Common/CustomModal';
import SelectOption from '../Select/SelectOption';
import StyledSwitch from '../Switch/StyledSwitch';
import PrimaryButton from '../Button/Primary';
import TextButton from '../Button/Text';
import './exportModal.css';

const ExportModal = ({ visible, onCancel, onExport, isLoading }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [includePastEvents, setIncludePastEvents] = useState(false);

  const dataModelOptions = useMemo(
    () => [
      {
        value: 'Artsdata',
        label: t('common.entityReport.exportEvents.options.artsdata'),
      },
      {
        value: 'DataScene',
        label: t('common.entityReport.exportEvents.options.datascene'),
        disabled: true,
      },
      {
        value: 'RawData',
        label: t('common.entityReport.exportEvents.options.rawData'),
        disabled: true,
      },
    ],
    [t],
  );

  const handleExport = async () => {
    if (isLoading) {
      return;
    }

    try {
      const values = await form.validateFields();
      onExport({
        dataModel: values.dataModel,
        sendTo: values.sendTo,
        includePastEvents,
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIncludePastEvents(false);
    onCancel();
  };

  return (
    <CustomModal
      visible={visible}
      onCancel={handleCancel}
      centered
      className="export-events-modal"
      title={
        <Typography.Title level={5} style={{ margin: 0, color: '#1f2635' }}>
          {t('common.entityReport.exportEvents.title')}
        </Typography.Title>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
          <TextButton label={t('common.entityReport.cancel')} onClick={handleCancel} disabled={isLoading} />
          <PrimaryButton
            label={
              isLoading ? (
                <Spin indicator={<LoadingOutlined style={{ fontSize: 20, color: 'white' }} spin />} />
              ) : (
                t('common.entityReport.exportEvents.export')
              )
            }
            onClick={handleExport}
          />
        </div>
      }>
      <div className="export-modal-content">
        <p className="export-modal-description">{t('common.entityReport.exportEvents.description')}</p>

        <Form form={form} layout="vertical" initialValues={{ dataModel: 'Artsdata', sendTo: 'MyComputer' }}>
          <Form.Item
            name="dataModel"
            label={
              <span className="form-label">
                {t('common.entityReport.exportEvents.dataModel')} <span className="required-asterisk">*</span>
              </span>
            }
            rules={[{ required: true, message: t('common.entityReport.exportEvents.validation.dataModel') }]}>
            <SelectOption
              placeholder={t('common.entityReport.exportEvents.selectDataModel')}
              options={dataModelOptions}
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item name="sendTo" hidden initialValue="MyComputer">
            <SelectOption />
          </Form.Item>

          <div className="switch-wrapper-container">
            <StyledSwitch
              checked={includePastEvents}
              onChange={(checked) => setIncludePastEvents(checked)}
              disabled={isLoading}
            />
            <span className="switch-label">{t('common.entityReport.exportEvents.includePastEvents')}</span>
          </div>

          {isLoading && (
            <p className="export-loading-message">{t('common.entityReport.exportEvents.exportInProgress')}</p>
          )}
        </Form>
      </div>
    </CustomModal>
  );
};

export default ExportModal;
