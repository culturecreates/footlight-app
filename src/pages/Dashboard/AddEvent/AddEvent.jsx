import React, { useEffect } from 'react';
import './addEvent.css';
import { Tabs, Form, DatePicker, Row, Col } from 'antd';
import LanguageInput from '../../../components/Input/Common/AuthenticationInput';
import moment from 'moment';
import { useAddEventMutation, useUpdateEventMutation } from '../../../services/events';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEventQuery, useUpdateEventStateMutation } from '../../../services/events';
import { PathName } from '../../../constants/pathName';
import Outlined from '../../../components/Button/Outlined';
import PrimaryButton from '../../../components/Button/Primary';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { userRoles } from '../../../constants/userRoles';
import PublishState from '../../../components/Dropdown/PublishState/PublishState';
import { eventPublishState } from '../../../constants/eventPublishState';

function AddEvent() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [addEvent] = useAddEventMutation();
  const { calendarId, eventId } = useParams();
  const { user } = useSelector(getUserDetails);
  const { t } = useTranslation();
  const { data: eventData, isError } = useGetEventQuery({ eventId, calendarId }, { skip: eventId ? false : true });
  const [updateEventState] = useUpdateEventStateMutation();
  const [updateEvent] = useUpdateEventMutation();

  const items = [
    {
      label: 'French',
      key: 'fr',
      children: (
        <Form.Item
          name="french"
          initialValue={eventData?.name?.fr}
          rules={[
            {
              required: true,
              message: t('dashboard.events.addEditEvent.validations.title'),
            },
          ]}>
          <LanguageInput autoComplete="off" />
        </Form.Item>
      ),
    },
    {
      label: 'English',
      key: 'en',
      children: (
        <Form.Item
          name="english"
          initialValue={eventData?.name?.en}
          rules={[
            {
              required: true,
              message: t('dashboard.events.addEditEvent.validations.title'),
            },
          ]}>
          <LanguageInput autoComplete="off" />
        </Form.Item>
      ),
    },
  ];

  const saveAsDraftHandler = () => {
    form.validateFields().then((values) => {
      var startDate = new Date(values?.datePicker?._d);
      startDate = startDate?.toISOString();
      if (!eventId || eventId === '') {
        addEvent({
          data: {
            name: {
              en: values?.english,
              fr: values?.french,
            },
            startDate: startDate,
          },
          calendarId,
        })
          .unwrap()
          .then(() => {
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`).catch((error) => console.log(error));
          })
          .catch((errorInfo) => {
            console.log(errorInfo);
          });
      } else {
        updateEvent({
          data: {
            name: {
              en: values?.english,
              fr: values?.french,
            },
            startDate: startDate,
          },
          calendarId,
          eventId,
        })
          .unwrap()
          .then(() => {
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const reviewPublishHandler = () => {
    console.log({ eventId, calendarId });
    updateEventState({ id: eventId, calendarId })
      .unwrap()
      .then(() =>
        navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}`).catch((error) => console.log(error)),
      );
  };

  useEffect(() => {
    if (isError) navigate(`${PathName.NotFound}`);
  }, [isError]);

  const roleCheckHandler = () => {
    const calendar = user?.roles.filter((calendar) => {
      return calendar.calendarId === calendarId;
    });
    if (
      calendar[0]?.role === userRoles.EDITOR ||
      calendar[0]?.role === userRoles.ADMIN ||
      calendar[0]?.role === userRoles.CONTRIBUTOR
    )
      return (
        <>
          <Form.Item>
            <Outlined
              htmlType="submit"
              label={t('dashboard.events.addEditEvent.saveOptions.saveAsDraft')}
              onClick={saveAsDraftHandler}
            />
          </Form.Item>
          <Form.Item>
            <PrimaryButton
              htmlType="submit"
              label={t('dashboard.events.addEditEvent.saveOptions.publish')}
              onClick={reviewPublishHandler}
            />
          </Form.Item>
        </>
      );
    else
      return (
        <>
          <Form.Item>
            <Outlined
              htmlType="submit"
              label={t('dashboard.events.addEditEvent.saveOptions.saveAsDraft')}
              onClick={saveAsDraftHandler}
            />
          </Form.Item>

          <Form.Item>
            <PrimaryButton
              htmlType="submit"
              label={t('dashboard.events.addEditEvent.saveOptions.sendToReview')}
              onClick={reviewPublishHandler}
            />
          </Form.Item>
        </>
      );
  };
  const ButtonDisplayHandler = () => {
    if (!eventId) {
      return roleCheckHandler();
    } else {
      if (eventData?.publishState === eventPublishState.PUBLISHED)
        return (
          <>
            <Form.Item>
              <PublishState eventId={eventId}>
                <span>{eventData?.publishState}</span>
              </PublishState>
            </Form.Item>
            <Form.Item>
              <PrimaryButton
                htmlType="submit"
                label={t('dashboard.events.addEditEvent.saveOptions.save')}
                onClick={saveAsDraftHandler}
              />
            </Form.Item>
          </>
        );
      else return roleCheckHandler();
    }
  };

  return (
    <Form form={form} layout="vertical" name="event">
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="add-edit-wrapper">
        <Col span={24}>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col xs={2} sm={4} md={6} lg={8} xl={10}>
              <div className="add-edit-event-heading">
                <h4>
                  {eventId
                    ? t('dashboard.events.addEditEvent.heading.editEvent')
                    : t('dashboard.events.addEditEvent.heading.newEvent')}
                </h4>
              </div>
            </Col>
            <div className="add-event-button-wrap">
              <ButtonDisplayHandler />
            </div>
          </Row>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col xs={24} sm={24} md={12} lg={10} xl={8}>
              <Form.Item label={t('dashboard.events.addEditEvent.language.title')}>
                <div className="card-container">
                  <Tabs type="card" items={items} />
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-content">
            <Col xs={24} sm={24} md={12} lg={10} xl={8}>
              <div className="add-event-date-wrap">{t('dashboard.events.addEditEvent.dates.dates')}</div>
              <Form.Item
                name="datePicker"
                label={t('dashboard.events.addEditEvent.dates.singleDate')}
                initialValue={moment(eventData?.startDate)}
                rules={[{ required: true, message: t('dashboard.events.addEditEvent.validations.date') }]}>
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
