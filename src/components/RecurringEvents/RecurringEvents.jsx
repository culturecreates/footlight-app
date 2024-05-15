import { Form, Select, Row, Col, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { dateFrequencyOptions, dateTypes, daysOfWeek } from '../../constants/dateTypes';
import './recurringEvents.css';
import RecurringModal from './RecurringModal/index';
import { ControlOutlined } from '@ant-design/icons';
import uniqid from 'uniqid';
import DateRangePicker from '../DateRangePicker';
import TimePickerStyled from '../TimePicker/TimePicker';
import i18n from 'i18next';
import TextButton from '../Button/Text';
import Tags from '../Tags/Common/Tags';
import { pluralize } from '../../utils/pluralise';
import { subEventsCountHandler } from '../../utils/subEventsCountHandler';
import { groupEventsByDate } from '../../utils/groupSubEventsConfigByDate';

const RecurringEvents = function ({
  currentLang,
  formFields,
  numberOfDaysEvent = 0,
  form,
  eventDetails,
  setFormFields,
  dateType,
}) {
  const [nummberofDates, setNumberofDates] = useState(numberOfDaysEvent);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customDates, setCustomDates] = useState([]);
  const [numberOfTimes, setNumberOfTimes] = useState(0);
  const [isCustom, setIsCustom] = useState(false);
  const [selectedWeekDays, setSelectedWeekDays] = useState([]);
  const [dateModified, setDateModified] = useState(false);
  const [subEventCount, setSubEventCount] = useState(0);
  const startDateRecur = Form.useWatch('startDateRecur', form);
  const { t } = useTranslation();
  Form.useWatch('endTimeRecur', form);
  Form.useWatch('startTimeRecur', form);

  useEffect(() => {
    if (eventDetails) {
      if (formFields?.frequency === 'CUSTOM' || eventDetails.recurringEvent?.frequency === 'CUSTOM') {
        setDateModified(true);
        setIsCustom(true);
      } else setIsCustom(false);
      if (eventDetails.recurringEvent?.customDates || eventDetails.subEventConfiguration) {
        setIsCustom(true);
        let recurringDates =
          eventDetails.recurringEvent?.customDates || groupEventsByDate(eventDetails.subEventConfiguration);
        const custom = recurringDates?.map((item) => {
          const obj = {
            id: uniqid(),
            name: 'test name',
            location: 'test Location',
            startDate: new Date(moment(item.startDate).format('YYYY/M/D')),
            endDate: new Date(moment(item.startDate).format('YYYY/M/D')),
            initDate: item?.startDate,
            isDeleted: false,
            color: '#607EFC',
            time: item?.customTimes
              ? item?.customTimes
                  ?.slice()
                  ?.sort((a, b) => a?.startTime?.localeCompare(b?.startTime))
                  ?.map((customTime) => {
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
            startDate: new Date(moment(item.startDate ?? item.startDateTime).format('YYYY-MM-DD')),
            endDate: new Date(moment(item.startDate ?? item.startDateTime).format('YYYY-MM-DD')),
            initDate: moment(item.startDate ?? item.startDateTime).format('YYYY-MM-DD'),
            isDeleted: false,
            time: [],
            color: '#607EFC',
          };
          return obj;
        });

        setCustomDates(custom);
      }
    }
  }, [eventDetails]);

  const onCustomize = (customizedDate) => {
    setCustomDates(customizedDate);
    setDateModified(true);
    if (customizedDate?.length > 0) {
      setIsCustom(true);
      setNumberofDates(customizedDate.length);
      const custom = customizedDate
        .filter((item) => !item.isDeleted)
        .map((item) => {
          const obj = {
            startDate: moment(item.startDate).format('YYYY-MM-DD'),
            customTimes: item.time
              ? item?.time?.map((customTime) => {
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
        startDateRecur: [moment(custom[0]?.startDate), moment(custom[custom?.length - 1]?.startDate)],
      });
      setFormFields({
        ...formFields,
        frequency: 'CUSTOM',
        customDates: custom,
        startDateRecur: [moment(custom[0]?.startDate), moment(custom[custom?.length - 1]?.startDate)],
      });
    }
  };
  useEffect(() => {
    if (formFields && formFields?.startDateRecur) {
      if (formFields?.frequency === 'DAILY') {
        setDateModified(false);
        getNumberOfDays(formFields?.startDateRecur[0], formFields?.startDateRecur[1]);
      } else if (formFields?.frequency === 'WEEKLY') {
        setDateModified(false);
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
      if (formFields.frequency === 'CUSTOM') {
        if (formFields?.startDateRecur?.length >= 1)
          if (!eventDetails) getNumberOfDays(formFields?.startDateRecur[0], formFields?.startDateRecur[1]);
        setIsCustom(true);
      } else setIsCustom(false);
    }
    if (formFields?.daysOfWeek) setSelectedWeekDays(formFields?.daysOfWeek);
  }, [formFields]);

  useEffect(() => {
    let numTimes = 0;
    customDates?.map((date) => (numTimes = numTimes + date?.time?.length));
    setNumberOfTimes(numTimes);
    setSubEventCount(subEventsCountHandler(customDates));
  }, [customDates]);
  useEffect(() => {
    if (dateType !== dateTypes.MULTIPLE) {
      setSubEventCount(0);
      setCustomDates([]);
    }
  }, [dateType]);

  const getNumberOfWeekDays = async (start, end, daysofweek) => {
    let date = [];

    daysofweek?.map((item) => date.push(getDaysBetweenDates(start, end, item)));
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
        color: '#607EFC',
      };
      return obj;
    });

    if (!dateModified) setCustomDates(custom);
  };

  const getNumberOfDays = async (start, end) => {
    let date = [];

    for (var m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
      date.push(m.format('DD/MM/YYYY'));
    }

    setNumberofDates(date?.length);
    const custom = date.map((item) => {
      const date = moment(item, 'DD/MM/YYYY');

      const obj = {
        id: uniqid(),
        name: 'test name',
        location: 'test Location',
        startDate: date.toDate(),
        endDate: date.toDate(),
        initDate: moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        isDeleted: false,
        time: [],
        color: '#607EFC',
      };
      return obj;
    });
    if (!dateModified) setCustomDates(custom);
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

  const openCustomize = () => {
    if (formFields && formFields?.frequency !== 'CUSTOM') {
      if (formFields?.startTimeRecur || formFields?.endTimeRecur) {
        const obj = {
          startTime: formFields?.startTimeRecur && moment(formFields?.startTimeRecur).format('hh:mm a'),
          endTime: formFields?.endTimeRecur && moment(formFields?.endTimeRecur).format('hh:mm a'),
          start: formFields?.startTimeRecur && moment(formFields?.startTimeRecur).format('HH:mm'),
          end: formFields?.endTimeRecur && moment(formFields?.endTimeRecur).format('HH:mm'),
        };
        setCustomDates(customDates.map((item) => ({ ...item, time: [obj] })));
      } else setCustomDates(customDates.map((item) => ({ ...item, time: [] })));
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
  const weekDaySelectHandler = (day) => {
    let selectedWeekDaysArray = selectedWeekDays;
    if (selectedWeekDays?.includes(day)) {
      selectedWeekDaysArray = selectedWeekDays?.filter((currentDay) => day != currentDay);
      setSelectedWeekDays(selectedWeekDaysArray);
    } else {
      selectedWeekDaysArray = [...selectedWeekDays, day];
      setSelectedWeekDays(selectedWeekDaysArray);
    }
    form.setFieldValue('daysOfWeek', selectedWeekDaysArray);
    setFormFields({
      ...formFields,
      daysOfWeek: selectedWeekDaysArray,
    });
  };

  return (
    <div className="recurring-events-wrapper">
      <div className="frequency-selector">
        <Form.Item
          name="frequency"
          label={t('dashboard.events.addEditEvent.dates.frequency')}
          initialValue={formFields?.frequency ?? dateFrequencyOptions[0]?.value}
          data-cy="form-item-date-frequency-label">
          <Select
            style={{ height: '40px' }}
            options={dateFrequencyOptions}
            defaultValue={dateFrequencyOptions[0]?.value}
            key="updateDropdownKey"
            optionFilterProp="children"
            data-cy="date-frequency-select"
          />
        </Form.Item>
      </div>

      {isCustom && (
        <>
          <div
            style={{
              width: '423px',
              maxWidth: '423px',
            }}></div>
          <Form.Item
            name="customDates"
            className="status-comment-item"
            hidden
            rules={[{ required: false, message: 'Start date required' }]}>
            <div></div>
          </Form.Item>
        </>
      )}

      <div className="flex-align">
        <div className="date-div">
          <Form.Item
            name="startDateRecur"
            className="status-comment-item"
            label={t('dashboard.events.addEditEvent.dates.multipleDates')}
            rules={[{ required: true, message: t('dashboard.events.addEditEvent.validations.date') }]}
            data-cy="form-item-multiple-start-date-range-label">
            <DateRangePicker
              style={{ width: '423px' }}
              disabled={(isCustom || formFields?.frequency === 'CUSTOM') && startDateRecur?.length == 2 && true}
              suffixIcon={
                subEventCount > 0 && (
                  <Tags
                    style={{ color: '#1572BB', borderRadius: '4px' }}
                    color={'#DBF3FD'}
                    data-cy="tag-sub-event-count">
                    {pluralize(subEventCount, t('dashboard.events.list.event'))}
                  </Tags>
                )
              }
              data-cy="multiple-start-date-range"
            />
          </Form.Item>
        </div>
      </div>

      {!isCustom && (
        <>
          {!isCustom && (
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
                    label={t('dashboard.events.addEditEvent.dates.startTime')}
                    data-cy="form-item-multiple-start-time-label">
                    <TimePickerStyled
                      placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                      use12Hours={i18n?.language === 'en' ? true : false}
                      format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                      data-cy="multiple-start-time"
                      onSelect={(value) => {
                        form.setFieldsValue({
                          startTimeRecur: value,
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex={'203.5px'}>
                  <Form.Item
                    name="endTimeRecur"
                    className="status-comment-item"
                    label={t('dashboard.events.addEditEvent.dates.endTime')}
                    data-cy="form-item-multiple-end-time">
                    <TimePickerStyled
                      placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                      use12Hours={i18n?.language === 'en' ? true : false}
                      format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                      disabledHours={disabledHours}
                      disabledMinutes={disabledMinutes}
                      data-cy="multiple-end-time"
                      onSelect={(value) => {
                        form.setFieldsValue({
                          endTimeRecur: value,
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {formFields && formFields?.frequency === dateFrequencyOptions[1].value && (
            <>
              {/* <div className="update-select-title">{t('Days Of Week', { lng: currentLang })}</div> */}
              {/* <Form.Item
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
              </Form.Item> */}
            </>
          )}
        </>
      )}
      <Form.Item
        name="daysOfWeek"
        label={t('dashboard.events.addEditEvent.dates.days')}
        hidden={formFields?.frequency === dateFrequencyOptions[1].value ? false : true}
        data-cy="form-item-days-of-week">
        <div style={{ display: 'flex', gap: '8px' }}>
          {daysOfWeek.map((day, index) => {
            return (
              <Button
                key={index}
                className="recurring-day-buttons"
                style={{
                  ...(selectedWeekDays?.includes(day?.value) && {
                    borderColor: '#607EFC',
                    backgroundColor: '#EFF2FF',
                  }),
                }}
                onClick={() => weekDaySelectHandler(day?.value)}
                data-cy="button-select-days">
                {day.name}
              </Button>
            );
          })}
        </div>
      </Form.Item>
      <div className="customize-div">
        {/* {nummberofDates !== 0 && <div> {nummberofDates + ' Dates'}</div>} */}
        {(nummberofDates || formFields?.startDateRecur?.length == 2 || isCustom) > 0 && (
          <TextButton
            size="large"
            icon={<ControlOutlined />}
            onClick={() => openCustomize()}
            label={t('dashboard.events.addEditEvent.dates.editDates')}
            data-cy="button-edit-dates"
          />
        )}
      </div>
      <RecurringModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        currentLang={currentLang}
        setCustomDates={onCustomize}
        customDates={customDates}
        nummberofDates={nummberofDates}
        numberOfTimes={numberOfTimes}
        setNumberOfTimes={setNumberOfTimes}
        isCustom={isCustom}
        parentForm={form}
        parentSetFormState={setFormFields}
        subEventCount={subEventCount}
        setSubEventCount={setSubEventCount}
      />
    </div>
  );
};
export default RecurringEvents;
