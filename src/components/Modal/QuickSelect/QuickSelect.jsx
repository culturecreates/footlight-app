import React from 'react';
import CustomModal from '../Common/CustomModal';
import { useTranslation } from 'react-i18next';
import { Row, Col } from 'antd';
import DateAction from '../../Button/DateAction/DateAction';
import OrganizationLogo from '../../../assets/icons/organization-light.svg?react';
import Icon, { UserOutlined } from '@ant-design/icons';
import './quickSelect.css';
import { featureFlags } from '../../../utils/featureFlags';

function QuickSelect(props) {
  const { open, setOpen, setQuickCreateOrganizerModal, setQuickCreatePersonModal } = props;
  const { t } = useTranslation();

  return (
    <CustomModal
      width={500}
      open={open}
      onCancel={() => setOpen(false)}
      title={
        <span className="quick-select-modal-title" data-cy="span-select-organizer-person-heading">
          {t('dashboard.events.addEditEvent.quickCreate.title')}
        </span>
      }
      footer={false}>
      <Row gutter={[0, 32]} className="quick-select-modal-wrapper">
        <Col span={24}>
          <span className="quick-select-modal-sub-heading" data-cy="span-select-organizer-person-subheading">
            {t('dashboard.events.addEditEvent.quickCreate.subHeading')}
          </span>
        </Col>
        <Col span={24}>
          <Row align={'middle'} justify={'center'} gutter={[36, 0]}>
            <Col span={12}>
              <DateAction
                style={{ width: '200px', height: '125px' }}
                iconrender={<UserOutlined style={{ fontSize: '12px', color: '#607EFC' }} />}
                label={t('dashboard.events.addEditEvent.quickCreate.person')}
                onClick={() => {
                  setOpen(!open);
                  setQuickCreatePersonModal(true);
                }}
                disabled={featureFlags.quickCreatePersonPlace === 'true' ? false : true}
                data-cy="button-select-person"
              />
            </Col>
            <Col span={12}>
              <DateAction
                style={{ width: '200px', height: '125px' }}
                iconrender={
                  <Icon
                    component={OrganizationLogo}
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
                data-cy="button-select-organizer"
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </CustomModal>
  );
}

export default QuickSelect;
