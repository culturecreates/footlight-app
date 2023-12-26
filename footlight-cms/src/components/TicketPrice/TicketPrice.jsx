import React from 'react';
import './ticketPrice.css';
import { Form, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import StyledInput from '../Input/Common';
import StyledNumberInput from '../Input/Number/StyledNumber';

function TicketPrice(props) {
  const { fields, add, remove, firstFieldName, secondFieldName, thirdFieldName } = props;
  const { t } = useTranslation();

  return (
    <table className="edit-price-table">
      <thead>
        <tr>
          <th>
            <p className="edit-price-title-primary" data-cy="para-ticket-price-label">
              {t('dashboard.events.addEditEvent.tickets.price')}
            </p>
          </th>
          <th>
            <p className="edit-price-title-primary" data-cy="para-ticket-price-description">
              {t('dashboard.events.addEditEvent.tickets.description')}
            </p>
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
                <StyledNumberInput
                  controls={false}
                  style={{ borderWidth: '0px' }}
                  addonAfter={t('dashboard.events.addEditEvent.tickets.CAD')}
                  data-cy="input-ticket-price-number"
                />
              </Form.Item>
            </td>
            <td>
              <Form.Item {...restField} name={[name, secondFieldName, thirdFieldName]}>
                <StyledInput
                  placeholder={t('dashboard.events.addEditEvent.tickets.enterType')}
                  data-cy="input-ticket-price-description"
                />
              </Form.Item>
            </td>
            <td>
              <Form.Item>
                <DeleteOutlined
                  onClick={() => remove(name)}
                  style={{ color: '#1B3DE6', fontSize: '20px' }}
                  data-cy="icon-remove-ticket-price"
                />
              </Form.Item>
            </td>
          </tr>
        ))}
        <tr>
          <td>
            <Form.Item>
              <Button
                type="text"
                size="small"
                style={{ color: '#1B3DE6', display: 'flex', gap: '8px' }}
                onClick={() => add()}
                icon={
                  <div
                    style={{
                      backgroundColor: '#EFF2FF',
                      borderRadius: '4px',
                      border: '0px',
                      height: '24px',
                      width: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    data-cy="button-add-ticket-price">
                    <PlusOutlined style={{ color: '#1B3DE6' }} />
                  </div>
                }>
                {t('dashboard.events.addEditEvent.tickets.anotherTicketType')}
              </Button>
            </Form.Item>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default TicketPrice;
