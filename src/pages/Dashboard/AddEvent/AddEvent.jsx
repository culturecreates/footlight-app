import React, { useEffect } from 'react';
import './addEvent.css';
import { Tabs, Form, DatePicker, Row, Col } from 'antd';
import LanguageInput from '../../../components/Input/Common/AuthenticationInput';
import moment from 'moment';
// import { useAddEventMutation } from '../../../services/events';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEventQuery } from '../../../services/events';
import { PathName } from '../../../constants/pathName';
import Outlined from '../../../components/Button/Outlined';
import PrimaryButton from '../../../components/Button/Primary';

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
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col span={24}>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col xs={2} sm={4} md={6} lg={8} xl={10}>
              <div>
                <h4>New Event</h4>
              </div>
            </Col>
            <div>
              <Form.Item>
                <Outlined htmlType="submit" label="Save as Draft" />
              </Form.Item>
              <Form.Item>
                <PrimaryButton htmlType="submit" label="Send for review" />
              </Form.Item>
              <Form.Item>
                <PrimaryButton htmlType="submit" label="Publish" />
              </Form.Item>
              <Form.Item>
                <PrimaryButton htmlType="submit" label="Save" />
              </Form.Item>
            </div>
          </Row>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col xs={24} sm={24} md={12} lg={10} xl={8}>
              <div className="card-container">
                <Form.Item label="Event Title">
                  <Tabs type="card" items={items} />
                </Form.Item>
              </div>
            </Col>
          </Row>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} span={24} className="events-content">
            <Col span={24}>
              <div>Dates</div>
              <Form.Item
                name="datePicker"
                label="Date"
                initialValue={moment(eventData?.startDate)}
                rules={[{ required: false, type: 'object', whitespace: true }]}>
                <DatePicker format="MM/DD/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
    </Form>
  );
}

export default AddEvent;
