import './addEvent.css';
import { Tabs, Form, Button, DatePicker } from 'antd';
import LanguageInput from '../../../components/Input/Common/AuthenticationInput';
import moment from 'moment';
// import { useAddEventMutation } from '../../../services/events';
// import { useParams } from 'react-router-dom';

function AddEvent() {
  const [form] = Form.useForm();
  // const [addEvent] = useAddEventMutation();
  // const { calendarId } = useParams();

  const items = [
    {
      label: `French`,
      key: 'french',
      children: (
        <Form.Item name="french">
          <LanguageInput autoComplete="off" />
        </Form.Item>
      ),
    },
    {
      label: `English`,
      key: 'english',
      children: (
        <Form.Item name="english">
          <LanguageInput autoComplete="off" />
        </Form.Item>
      ),
    },
  ];
  const onFinish = (values) => {
    var startDate = new Date(values?.datePicker?._d);
    startDate = startDate?.toISOString();
    console.log(startDate);
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
  return (
    <Form form={form} layout="vertical" onFinish={onFinish} name="event">
      <div className="card-container">
        <Tabs type="card" items={items} />
      </div>
      <Form.Item
        name="datePicker"
        label="Date"
        initialValue={moment()}
        rules={[{ required: false, type: 'object', whitespace: true }]}>
        <DatePicker format="MM/DD/YYYY" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

export default AddEvent;
