import React, { useEffect } from 'react';
import './addEvent.css';
import { Tabs, Form, Button, DatePicker } from 'antd';
import LanguageInput from '../../../components/Input/Common/AuthenticationInput';
import moment from 'moment';
// import { useAddEventMutation } from '../../../services/events';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEventQuery } from '../../../services/events';
import { PathName } from '../../../constants/pathName';
import Outlined from '../../../components/Button/Outlined';

function AddEvent() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  // const [addEvent] = useAddEventMutation();
  const { calendarId, eventId } = useParams();
  const { data: eventData, isError } = useGetEventQuery({ eventId, calendarId }, { skip: eventId ? false : true });

  const items = [
    {
      label: 'French',
      key: 'fr',
      children: (
        <Form.Item name="french" initialValue={eventData?.name?.fr}>
          <LanguageInput autoComplete="off" />
        </Form.Item>
      ),
    },
    {
      label: 'English',
      key: 'en',
      children: (
        <Form.Item name="english" initialValue={eventData?.name?.en}>
          <LanguageInput autoComplete="off" />
        </Form.Item>
      ),
    },
  ];

  const onFinish = (values) => {
    // var startDate = new Date(values?.datePicker?._d);
    // startDate = startDate?.toISOString();
    console.log(values);
    // addEvent({
    //   data: {
    //     name: {
    //       en: values?.english,
    //       fr: values?.french,
    //     },
    //     startDate: startDate,
    //   },
    //   calendarId,
    // }).then((res) => {
    //   console.log(res).catch((error) => console.log(error));
    // });
  };
  useEffect(() => {
    if (isError) navigate(`${PathName.NotFound}`);
  }, [isError]);

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} name="event">
      <div className="card-container">
        <Tabs type="card" items={items} />
      </div>

      <Form.Item
        name="datePicker"
        label="Date"
        initialValue={moment(eventData?.startDate)}
        rules={[{ required: false, type: 'object', whitespace: true }]}>
        <DatePicker format="MM/DD/YYYY" />
      </Form.Item>

      <Form.Item>
        <Outlined htmlType="submit" label="Save as Draft" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Send for review
        </Button>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Publish
        </Button>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
}

export default AddEvent;
