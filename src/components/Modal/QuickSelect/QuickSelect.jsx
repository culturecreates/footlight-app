import React from 'react';
import CustomModal from '../Common/CustomModal';
import { useTranslation } from 'react-i18next';
import { Row, Col } from 'antd';
import DateAction from '../../Button/DateAction/DateAction';
import { ReactComponent as Organizations } from '../../../assets/icons/organisations.svg';
import Icon, { UserOutlined } from '@ant-design/icons';

function QuickSelect(props) {
  const { open, setOpen, setQuickCreateOrganizerModal } = props;
  const { t } = useTranslation();

  return (
    <CustomModal open={open} title={<span>{t('dashboard.events.addEditEvent.quickCreate.title')}</span>} footer={false}>
      <Row gutter={[0, 10]}>
        <Col span={24}>
          <span>{t('dashboard.events.addEditEvent.quickCreate.subHeading')}</span>
        </Col>
        <Col span={24}>
          <Row align={'middle'} justify={'center'}>
            <Col span={8}>
              <DateAction
                iconrender={<UserOutlined style={{ fontSize: '12px', color: '#9196A3' }} />}
                label={t('dashboard.events.addEditEvent.quickCreate.person')}
                disabled
              />
            </Col>
            <Col span={8}>
              <DateAction
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
