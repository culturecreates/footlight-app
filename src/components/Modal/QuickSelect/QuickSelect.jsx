import React from 'react';
import CustomModal from '../Common/CustomModal';
import { useTranslation } from 'react-i18next';
import { Row, Col } from 'antd';
import DateAction from '../../Button/DateAction/DateAction';
import { ReactComponent as Organizations } from '../../../assets/icons/organisations.svg';
import Icon, { UserOutlined } from '@ant-design/icons';
import './quickSelect.css';

function QuickSelect(props) {
  const { open, setOpen, setQuickCreateOrganizerModal } = props;
  const { t } = useTranslation();

  return (
    <CustomModal
      width={500}
      open={open}
      onCancel={() => setOpen(false)}
      title={<span className="quick-select-modal-title">{t('dashboard.events.addEditEvent.quickCreate.title')}</span>}
      footer={false}>
      <Row gutter={[0, 32]} className="quick-select-modal-wrapper">
        <Col span={24}>
          <span className="quick-select-modal-sub-heading">
            {t('dashboard.events.addEditEvent.quickCreate.subHeading')}
          </span>
        </Col>
        <Col span={24}>
          <Row align={'middle'} justify={'center'} gutter={[36, 0]}>
            <Col span={12}>
              <DateAction
                style={{ width: '200px', height: '125px' }}
                iconrender={<UserOutlined style={{ fontSize: '12px', color: '#9196A3' }} />}
                label={t('dashboard.events.addEditEvent.quickCreate.person')}
                disabled
              />
            </Col>
            <Col span={12}>
              <DateAction
                style={{ width: '200px', height: '125px' }}
                iconrender={
                  <Icon
                    component={Organizations}
                    style={{
                      fontSize: '12px',
                      color: '#607EFC',
                    }}
                  />
                }
                label={t('dashboard.events.addEditEvent.quickCreate.organization')}
                onClick={() => {
                  setOpen(!open);
                  setQuickCreateOrganizerModal(true);
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </CustomModal>
  );
}

export default QuickSelect;
