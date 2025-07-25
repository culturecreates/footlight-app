import { Col, Dropdown, Form, message, notification, Spin, Typography } from 'antd';
import React, { useState, useCallback } from 'react';
import { MoreOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ReportIcon } from '../../assets/icons/report.svg';
import CustomModal from '../Modal/Common';
import './entitiesReport.css';
import { DATABASE_ACTION_KEY, IMPORT_ACTION_KEY, REPORT_ACTION_KEY } from '../../constants/entitiesClass';
import { downloadDB, fetchEntityReport } from '../../services/generateReport';
import { adminCheckHandler } from '../../utils/adminCheckHandler';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/reducer/userSlice';
import { getCurrentCalendarDetailsFromUserDetails } from '../../utils/getCurrentCalendarDetailsFromUserDetails';
import ReportForm from './ReportForm';

const EntityReports = ({ entity, includedDropdownKeys = [REPORT_ACTION_KEY] }) => {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { user } = useSelector(getUserDetails);

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
    ...(adminCheckHandler({ user, calendar: getCurrentCalendarDetailsFromUserDetails(user, calendarId) })
      ? [
          {
            key: REPORT_ACTION_KEY,
            label: t(`common.entityReport.downloadReport`),
            icon: <ReportIcon style={{ ...reportIconStyle, color: '#1B3DE6' }} />,
          },
          {
            key: DATABASE_ACTION_KEY,
            disabled: true,
            label: t(`common.entityReport.downloadDB`),
            icon: <ReportIcon style={{ ...reportIconStyle, color: '#1B3DE6' }} />,
          },
        ]
      : []),
  ]?.filter((item) => includedDropdownKeys.includes(item.key));

  if (ITEMS.length === 0) return null;

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
      downloadDB({ calendarId }).then(() => {
        notification.success({
          key: 'entity-db-download-started',
          description: t('common.entityReport.success'),
          duration: 0,
        });
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
      const values = await form.validateFields();

      try {
        const response = await fetchEntityReport({
          calendarId,
          startDate: values.startDate.format('YYYY-MM-DD'),
          endDate: values.endDate.format('YYYY-MM-DD'),
          entity,
          taxonomyIds: values?.taxonomies || [],
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

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${entity}-report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    cleanupBlobUrl();
    setBlobUrl(null);
  };

  const renderOkButton = () => {
    if (isLoading) {
      return <Spin indicator={<LoadingOutlined style={{ fontSize: 20, color: 'white' }} spin />} />;
    }
    if (blobUrl) return t('common.entityReport.download');

    return t('common.entityReport.generate');
  };

  return (
    <Col className="entity-options-dropdown-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
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
        onOk={!blobUrl ? generateReport : downloadFile}
        onCancel={handleCancel}
        className="entity-report-modal"
        okText={renderOkButton()}
        cancelText={t('common.entityReport.cancel')}>
        <div className="modal-content-wrapper">
          {modalActionKey === DATABASE_ACTION_KEY && t('common.entityReport.downloadDbDescription')}
          {modalActionKey === REPORT_ACTION_KEY && (
            <ReportForm
              entity={entity}
              blobUrl={blobUrl}
              cleanupBlobUrl={cleanupBlobUrl}
              setBlobUrl={setBlobUrl}
              form={form}
            />
          )}
        </div>
      </CustomModal>
    </Col>
  );
};

export default EntityReports;
