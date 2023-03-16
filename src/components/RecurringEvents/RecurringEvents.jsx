import { Card, Form, Select, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { daysOfWeek } from '../../constants/dateTypes';
import './recurringEvents.css';
import RecurringModal from './RecurringModal/index';
import { EditOutlined } from '@ant-design/icons';
import uniqid from 'uniqid';
import DateRangePicker from '../DateRangePicker';
import TimePickerStyled from '../TimePicker/TimePicker';
import i18n from 'i18next';

const { Option } = Select;
const RecurringEvents = function ({ currentLang = 'fr', formFields, numberOfDaysEvent = 0, form, eventDetails }) {
  const endDisable = moment().format('YYYY-MM-DD');
  const [nummberofDates, setNumberofDates] = useState(numberOfDaysEvent);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customDates, setCustomDates] = useState([]);
  const [isCustom, setIsCustom] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (eventDetails) {
      if (formFields?.frequency === 'CUSTOM' || eventDetails.recurringEvent?.frequency === 'CUSTOM') setIsCustom(true);
      else setIsCustom(false);
      if (eventDetails.recurringEvent?.customDates) {
        setIsCustom(true);
        const custom = eventDetails.recurringEvent?.customDates.map((item) => {
          const obj = {
            id: uniqid(),
            name: 'test name',
            location: 'test Location',
            startDate: new Date(moment(item.startDate).format('YYYY/M/D')),
            endDate: new Date(moment(item.startDate).format('YYYY/M/D')),
            initDate: item.startDate,
            isDeleted: false,
            time: item.customTimes
              ? item.customTimes
                  .sort((a, b) => a?.startTime?.localeCompare(b?.startTime))
                  .map((customTime) => {
                    const objTime = {
                      startTime: customTime.startTime && moment(customTime.startTime, 'hh:mm a').format('hh:mm a'),
                      endTime: customTime.endTime && moment(customTime.endTime, 'hh:mm a').format('hh:mm a'),
                      start: customTime.startTime,
                      end: customTime.endTime,
                    };
                    return objTime;
                  })
              : [],
          };
          return obj;
        });
        setCustomDates(custom);
      } else {
        const custom = eventDetails.subEvents.map((item) => {
          const obj = {
            id: uniqid(),
            name: 'test name',
            location: 'test Location',
            startDate: new Date(moment(item.startDate).format('YYYY,M,D')),
            endDate: new Date(moment(item.startDate).format('YYYY,M,D')),
            initDate: moment(item.startDate).format('YYYY-MM-DD'),
            isDeleted: false,
            time: [],
          };
          return obj;
        });

        setCustomDates(custom);
      }
    }
  }, [eventDetails]);

  const onCustomize = (customizedDate) => {
    setCustomDates(customizedDate);
    if (customizedDate.length > 0) {
      setIsCustom(true);
      setNumberofDates(customizedDate.length);
      const custom = customizedDate
        .filter((item) => !item.isDeleted)
        .map((item) => {
          const obj = {
            startDate: moment(item.startDate).format('YYYY-MM-DD'),
            customTimes: item.time
              ? item.time.map((customTime) => {
                  const obj = {
                    startTime: customTime?.start,
                    endTime: customTime?.end && customTime.end,
                  };
                  return obj;
                })
              : [],
          };
          return obj;
        });
      form.setFieldsValue({
        frequency: 'CUSTOM',
        customDates: custom,
      });
    }
  };
  useEffect(() => {
    if (formFields && formFields?.startDateRecur) {
      if (formFields?.frequency === 'DAILY') {
        getNumberOfDays(formFields?.startDateRecur[0], formFields?.startDateRecur[1]);
      } else if (formFields?.frequency === 'WEEKLY') {
        getNumberOfWeekDays(
          moment(new Date(formFields?.startDateRecur[0]), 'YYYY,MM,DD'),
          moment(new Date(formFields?.startDateRecur[1]), 'YYYY,MM,DD'),
          formFields.daysOfWeek,
        );
      } else {
        setNumberofDates(0);
      }
    }
    if (formFields?.frequency) {
      if (formFields?.frequency === 'CUSTOM') setIsCustom(true);
      else setIsCustom(false);
    }
  }, [formFields]);

  const getNumberOfWeekDays = async (start, end, daysofweek) => {
    let date = [];

    daysofweek.map((item) => date.push(getDaysBetweenDates(start, end, item)));
    setNumberofDates([].concat.apply([], date).length);
    const custom = [].concat.apply([], date).map((item) => {
      const obj = {
        id: uniqid(),
        name: 'test name',
        location: 'test Location',
        startDate: item,
        endDate: item,
        initDate: moment(item).format('YYYY-MM-DD'),
        isDeleted: false,
      };
      return obj;
    });

    setCustomDates(custom);
  };

  const getNumberOfDays = async (start, end) => {
    let date = [];

    for (var m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
      date.push(m.format('DD/MM/YYYY'));
    }

    setNumberofDates(date.length);

    const custom = date.map((item) => {
      const date = moment(item, 'DD/MM/YYYY');

      const obj = {
        id: uniqid(),
        name: 'test name',
        location: 'test Location',
        startDate: new Date(moment(date).format('YYYY,M,D')),
        endDate: new Date(moment(date).format('YYYY,M,D')),
        initDate: moment(date).format('YYYY-MM-DD'),
        isDeleted: false,
        time: [],
      };
      return obj;
    });

    setCustomDates(custom);
  };
  function getDaysBetweenDates(start, end, dayName) {
    var result = [];
    var days = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    var day = days[dayName.toLowerCase()];
    // Copy start date
    var current = new Date(start);
    // Shift to next of required days
    current.setDate(current.getDate() + ((day - current.getDay() + 7) % 7));
    // While less than end date, add dates to result array
    while (current <= end) {
      result.push(new Date(+current));
      current.setDate(current.getDate() + 7);
    }

    return result;
  }

  const handleChange = (value) => {
    if (value === 'CUSTOM') setIsModalVisible(true);
  };

  const openCustomize = () => {
    if (formFields && formFields?.frequency !== 'CUSTOM') {
      const obj = {
        startTime: formFields?.startTimeRecur && moment(formFields?.startTimeRecur).format('hh:mm a'),
        endTime: formFields?.endTimeRecur && moment(formFields?.endTimeRecur).format('hh:mm a'),
        start: formFields?.startTimeRecur && moment(formFields?.startTimeRecur).format('HH:mm'),
        end: formFields?.endTimeRecur && moment(formFields?.endTimeRecur).format('HH:mm'),
      };
      setCustomDates(customDates.map((item) => ({ ...item, time: [obj] })));
    }

    setIsModalVisible(true);
  };

  const disabledHours = () => {
    const hours = [];
    const currentHour = formFields?.startTimeRecur
      ? moment(formFields?.startTimeRecur).hour()
      : moment('00:02', 'HH:mm').hour();

    for (let i = 0; i < currentHour; i++) {
      hours.push(i);
    }

    return hours;
  };

  const disabledMinutes = () => {
    const minutes = [];
    return minutes;
  };

  return (
    <Card className="recurring-card">
      <div className="update-select-title">{t('Frequency', { lng: currentLang })}</div>

      <Form.Item
        name="frequency"
        className="status-comment-item"
        rules={[{ required: true, message: 'Start date required' }]}>
        <Select
          style={{ width: 337 }}
          placeholder={`Select Frequency`}
          key="updateDropdownKey"
          className="search-select"
          optionFilterProp="children"
          defaultValue="DAILY"
          onChange={handleChange}>
          <Option value="DAILY">Daily</Option>
          <Option value="WEEKLY">Weekly</Option>
          <Option value="CUSTOM">Custom</Option>
        </Select>
      </Form.Item>
      {isCustom && (
        <>
          <div>
            {customDates.map((item, index) => (
              <Card key={index}>
                <div className="custom-no-of-date">{moment(item.startDate).format('dddd DD MMM YYYY')}</div>

                {item?.time &&
                  item?.time?.map((customTime, index) => (
                    <div key={index}>
                      {customTime.startTime} {customTime.endTime ? ' - ' : ''}
                      {customTime.endTime && customTime.endTime}{' '}
                    </div>
                  ))}
              </Card>
            ))}
          </div>
          <Form.Item
            name="customDates"
            className="status-comment-item"
            rules={[{ required: false, message: 'Start date required' }]}>
            <div></div>
          </Form.Item>
        </>
      )}
      {!isCustom && (
        <>
          {formFields && formFields?.frequency === 'WEEKLY' && (
            <>
              <div className="update-select-title">{t('Days Of Week', { lng: currentLang })}</div>
              <Form.Item
                name="daysOfWeek"
                className="status-comment-item"
                rules={[{ required: true, message: 'Start date required' }]}>
                <Select
                  style={{ width: 337 }}
                  placeholder={`Select Days`}
                  key="updateDropdownKey"
                  className="search-select"
                  optionFilterProp="children"
                  showSearch
                  mode="multiple"
                  filterOption={(input, option) =>
                    option.children && option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }>
                  {daysOfWeek.map((item) => (
                    <Option value={item.value} key={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
          <div className="flex-align">
            <div className="date-div">
              <Form.Item
                name="startDateRecur"
                className="status-comment-item"
                label={t('dashboard.events.addEditEvent.dates.multipleDates')}
                rules={[{ required: true, message: t('dashboard.events.addEditEvent.validations.date') }]}>
                <DateRangePicker style={{ width: '423px' }} disabledDate={(d) => !d || d.isSameOrBefore(endDisable)} />
              </Form.Item>
            </div>
          </div>
          <div className="flex-align">
            {/* <div className="date-div">
              <div className="update-select-title">{t('StartTime', { lng: currentLang })}</div>
              <Form.Item
                name="startTimeRecur"
                className="status-comment-item"
                rules={[{ required: false, message: 'Start time required' }]}>
                <TimePicker format="HH:mm" />
              </Form.Item>
            </div>
            <div className="date-div">
              <div className="update-select-title ">{t('EndTime', { lng: currentLang })}</div>
              <Form.Item
                name="endTimeRecur"
                className="status-comment-item"
                rules={[{ required: false, message: 'End time required' }]}>
                <TimePicker format="HH:mm" disabledHours={disabledHours} disabledMinutes={disabledMinutes} />
              </Form.Item>
            </div> */}
            <Row justify="space-between">
              <Col flex={'203.5px'}>
                <Form.Item
                  name="startTimeRecur"
                  className="status-comment-item"
                  label={t('dashboard.events.addEditEvent.dates.startTime')}>
                  <TimePickerStyled
                    placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                    use12Hours={i18n?.language === 'en' ? true : false}
                    format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                  />
                </Form.Item>
              </Col>
              <Col flex={'203.5px'}>
                <Form.Item
                  name="endTimeRecur"
                  className="status-comment-item"
                  label={t('dashboard.events.addEditEvent.dates.endTime')}>
                  <TimePickerStyled
                    placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                    use12Hours={i18n?.language === 'en' ? true : false}
                    format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                    disabledHours={disabledHours}
                    disabledMinutes={disabledMinutes}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </>
      )}
      <div className="customize-div">
        {nummberofDates !== 0 && <div> {nummberofDates + ' Dates'}</div>}

        <div onClick={() => openCustomize()} className="customize">
          <EditOutlined />
          Customize
        </div>
      </div>
      <RecurringModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        currentLang={currentLang}
        setCustomDates={onCustomize}
        customDates={customDates}
      />
    </Card>
  );
};
export default RecurringEvents;
