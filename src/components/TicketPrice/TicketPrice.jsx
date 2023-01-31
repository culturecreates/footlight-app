import React, { useEffect } from 'react';
import './ticketPrice.css';
import { Form, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import StyledInput from '../Input/Common';

function TicketPrice(props) {
  const { fields, add, remove, firstFieldName, secondFieldName } = props;
  const { t } = useTranslation();

  useEffect(() => {
    if (fields?.length < 1) {
      add();
      remove([1, 2, 3]);
    }
  }, []);

  return (
    <table className="edit-price-table">
      <thead>
        <tr>
          <th>
            <p className="edit-price-title-primary">{t('dashboard.events.addEditEvent.tickets.price')}</p>
          </th>
          <th>
            <p className="edit-price-title-primary ">{t('dashboard.events.addEditEvent.tickets.description')}</p>
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {fields.map(({ key, name, ...restField }) => (
          <tr key={key}>
            <td style={{ width: '25%' }}>
              <Form.Item
                {...restField}
                name={[name, firstFieldName]}
                // rules={[
                //   {
                //     type: 'number',
                //     message: t('dashboard.events.addEditEvent.validations.ticket.invalidData'),
                //   },
                // ]}
              >
                <StyledInput
                  style={{ borderWidth: '0px' }}
                  addonAfter={t('dashboard.events.addEditEvent.tickets.CAD')}
                />
              </Form.Item>
            </td>
            <td>
              <Form.Item {...restField} name={[name, secondFieldName]}>
                <StyledInput placeholder={t('dashboard.events.addEditEvent.tickets.enterType')} />
              </Form.Item>
            </td>
            <td>
              <Form.Item>
                <DeleteOutlined onClick={() => remove(name)} style={{ color: '#1B3DE6', fontSize: '20px' }} />
              </Form.Item>
            </td>
          </tr>
        ))}
        <Form.Item>
          <Button
            type="text"
            size="small"
            style={{ color: '#1B3DE6', display: 'flex', gap: '8px' }}
            onClick={() => add()}
            icon={
              <Button
                shape="default"
                size="small"
                style={{
                  backgroundColor: '#EFF2FF',
                  borderRadius: '4px',
                  border: '0px',
                }}>
                <PlusOutlined style={{ color: '#1B3DE6' }} />
              </Button>
            }>
            {t('dashboard.events.addEditEvent.tickets.anotherTicketType')}
          </Button>
        </Form.Item>
      </tbody>
    </table>
  );
}

export default TicketPrice;
