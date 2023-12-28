import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './addEvent.css';

function AddEvent(props) {
  return (
    <Button className="add-event-button" type="primary" icon={<PlusOutlined style={{ fontSize: '24px' }} />} {...props}>
      {props.label}
    </Button>
  );
}

export default AddEvent;
