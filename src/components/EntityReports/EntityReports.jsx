import { Col, Dropdown, Form, message, notification, Row, Spin, Typography } from 'antd';
import React, { useState, useCallback } from 'react';
import { MoreOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ReportIcon } from '../../assets/icons/report.svg';
import CustomModal from '../Modal/Common';
import DatePickerStyled from '../DatePicker';
import './entitiesReport.css';
import { DATABASE_ACTION_KEY, IMPORT_ACTION_KEY, REPORT_ACTION_KEY } from '../../constants/entitiesClass';
import { downloadDB, fetchEntityReport } from '../../services/generateReport';

const EntityReports = ({ entity, includedDropdownKeys = [REPORT_ACTION_KEY] }) => {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalActionKey, setModalActionKey] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);

  // Styles
  const iconStyle = (color) => ({
    color,
    fontWeight: 600,
    fontSize: '20px',
  });

  const reportIconStyle = {
    width: '24px',
    height: '24px',
  };

  const moreIconStyle = {
    color: '#1B3DE6',
    fontSize: '24px',
    height: '40px',
    width: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const ITEMS = [
    {
      key: IMPORT_ACTION_KEY,
      label: t(`common.entityReport.${entity.toLowerCase()}.import`),
      icon: <DownloadOutlined style={iconStyle('#1B3DE6')} />,
    },
    {
      key: REPORT_ACTION_KEY,
      label: t(`common.entityReport.downloadReport`),
      icon: <ReportIcon style={{ ...reportIconStyle, color: '#1B3DE6' }} />,
    },
    {
      key: DATABASE_ACTION_KEY,
      label: t(`common.entityReport.downloadDB`),
      icon: <ReportIcon style={{ ...reportIconStyle, color: '#1B3DE6' }} />,
    },
  ].filter((item) => includedDropdownKeys.includes(item.key));

  const menuItems = {
    items: ITEMS,
    onClick: handleMenuClick,
  };

  function handleMenuClick({ key }) {
    switch (key) {
      case IMPORT_ACTION_KEY:
        navigate(`${location.pathname}/search`);
        break;

      case REPORT_ACTION_KEY:
        setModalActionKey(key);
        setIsModalVisible(true);
        setBlobUrl(null);
        break;
      case DATABASE_ACTION_KEY:
        setModalActionKey(key);
        setBlobUrl(null);
        handleDbDownload();
        break;
      default:
        break;
    }
  }

  const generateReport = async () => {
    if (modalActionKey === REPORT_ACTION_KEY) {
      await handleReportGeneration();
    } else if (modalActionKey === DATABASE_ACTION_KEY) {
      handleDatabaseDownload();
    }
  };

  // Function to handle db download

  const handleDbDownload = async () => {
    setIsLoading(true);
    try {
      notification.success({
        key: 'entity-db-download-started',
        description: t('common.entityReport.success'),
        duration: 0,
      });
      downloadDB({ calendarId }).then((response) => {
        cleanupBlobUrl();
        const url = window.URL.createObjectURL(new Blob([response], { type: 'application/json' }));
        setBlobUrl(url);
        const link = document.createElement('a');
        link.href = url;
        link.download = `database.json`;
        link.click();
      });
    } catch (error) {
      notification.error({
        key: 'entity-report-error',
        message: t('common.entityReport.error'),
        description: error.message,
        duration: 5,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportGeneration = async () => {
    setIsLoading(true);
    try {
      const values = await form.validateFields(['startDate', 'endDate']);
      notification.success({
        key: 'entity-report-success',
        description: t('common.entityReport.success'),
        duration: 5,
        placement: 'center',
      });
      try {
        const response = await fetchEntityReport({
          calendarId,
          startDate: values.startDate.format('YYYY-MM-DD'),
          endDate: values.endDate.format('YYYY-MM-DD'),
          entity,
        });

        cleanupBlobUrl();
        const url = window.URL.createObjectURL(response);
        setBlobUrl(url);
      } catch (error) {
        notification.error({
          key: 'entity-report-error',
          message: t('common.entityReport.error'),
          description: error.message,
          duration: 5,
          placement: 'center',
        });
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDatabaseDownload = () => {
    setIsModalVisible(false);
    message.success(t('common.entityReport.databaseDownloaded'));
  };

  const cleanupBlobUrl = useCallback(() => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
  }, [blobUrl]);

  const handleCancel = () => {
    cleanupBlobUrl();
    setBlobUrl(null);
    setIsModalVisible(false);
  };

  const renderModalTitle = () => (
    <Typography.Title level={5} style={{ margin: 0 }}>
      {t(`common.entityReport.${modalActionKey === REPORT_ACTION_KEY ? 'downloadReport' : 'downloadDB'}`)}
    </Typography.Title>
  );

  const renderOkButton = () => {
    if (isLoading) {
      return <Spin indicator={<LoadingOutlined style={{ fontSize: 20, color: 'white' }} spin />} />;
    }
    if (blobUrl) {
      return (
        <a href={blobUrl} download={`${entity}-report.csv`}>
          {t('common.entityReport.download')}
        </a>
      );
    }
    return t('common.entityReport.generate');
  };

  const renderDateRangeForm = () => (
    <Form form={form}>
      <Row gutter={[4, 4]} style={{ padding: '16px 16px' }}>
        <Col span={24} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Typography.Text strong>{t('common.entityReport.timeFrame')}</Typography.Text>
          <Typography.Text type="danger">*</Typography.Text>
        </Col>
        <Col span={24} style={dateRangeContainerStyle}>
          <Form.Item
            name="startDate"
            style={formItemStyle}
            rules={[
              { required: true, message: t('common.entityReport.validation.dateRange') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const endDate = getFieldValue('endDate');
                  if (!value || !endDate || value.isSameOrBefore(endDate, 'day')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('common.entityReport.validation.startBeforeEnd')));
                },
              }),
            ]}>
            <DatePickerStyled
              disabledDate={(current) => {
                const endDate = form.getFieldValue('endDate');
                return endDate && current && current.isAfter(endDate, 'day');
              }}
            />
          </Form.Item>

          <Typography.Text type="secondary" style={{ alignSelf: 'center' }}>
            {t('common.entityReport.to')}
          </Typography.Text>

          <Form.Item
            name="endDate"
            style={formItemStyle}
            rules={[
              { required: true, message: t('common.entityReport.validation.dateRange') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue('startDate');
                  if (!value || !startDate || value.isSameOrAfter(startDate, 'day')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('common.entityReport.validation.endAfterStart')));
                },
              }),
            ]}>
            <DatePickerStyled
              disabledDate={(current) => {
                const startDate = form.getFieldValue('startDate');
                return startDate && current && current.isBefore(startDate, 'day');
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  // Styles for components
  const dateRangeContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  };

  const formItemStyle = {
    flex: 1,
    marginBottom: 0,
  };

  return (
    <Col style={{ display: 'flex', alignItems: 'center' }}>
      <Dropdown
        placement="bottomRight"
        className="calendar-dropdown-wrapper"
        overlayStyle={{ minWidth: '160px', whiteSpace: 'nowrap' }}
        getPopupContainer={(trigger) => trigger.parentNode}
        menu={menuItems}
        trigger={['click']}>
        <MoreOutlined className="event-list-more-icon" style={moreIconStyle} data-cy="icon-event-list-more-options" />
      </Dropdown>

      <CustomModal
        title={renderModalTitle()}
        maskClosable={false}
        destroyOnClose={true}
        visible={isModalVisible}
        onOk={!blobUrl && generateReport}
        onCancel={handleCancel}
        className="entity-report-modal"
        okText={renderOkButton()}
        cancelText={t('common.entityReport.cancel')}>
        <div className="modal-content-wrapper">
          {modalActionKey === DATABASE_ACTION_KEY && t('common.entityReport.downloadDbDescription')}
          {modalActionKey === REPORT_ACTION_KEY && renderDateRangeForm()}
        </div>
      </CustomModal>
    </Col>
  );
};

export default EntityReports;
