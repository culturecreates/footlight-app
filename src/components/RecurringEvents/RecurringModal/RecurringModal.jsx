import { Col, Divider, Row, Form, Checkbox, Empty, Grid } from 'antd';
import React, { useEffect, useState } from 'react';
import Calendar from 'rc-year-calendar';
import 'rc-year-calendar/locales/rc-year-calendar.fr';
import uniqid from 'uniqid';
import moment from 'moment';
import {
  DeleteFilled,
  DeleteOutlined,
  CopyOutlined,
  PlusOutlined,
  UndoOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import CopyTimeModal from '../CopyTimeModal/index';
import '../recurringEvents.css';
import CustomModal from '../../Modal/Common/CustomModal';
import TextButton from '../../Button/Text';
import PrimaryButton from '../../Button/Primary';
import Tags from '../../Tags/Common/Tags';
import TimePickerStyled from '../../TimePicker/TimePicker';
import i18n from 'i18next';
import { subEventsCountHandler } from '../../../utils/subEventsCountHandler';
import { pluralize } from '../../../utils/pluralise';

const { useBreakpoint } = Grid;

const RecurringModal = ({
  isModalVisible,
  setIsModalVisible,
  currentLang,
  setCustomDates,
  customDates,
  setNumberOfTimes,
  subEventCount,
  setSubEventCount,
  defaultSelectedStartDate,
}) => {
  const [dateSource, setDataSource] = useState([]);
  const [test, setTest] = useState();
  const [dateArrayCal, setDateArrayCal] = useState(null);
  const [showAddTime, setShowAddTime] = useState(false);
  const [updateAllTime, setUpdateAllTime] = useState(false);
  const [copyModal, setCopyModal] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState('-100');
  const [selectedCopyTime, setSelectedCopyTime] = useState();
  const [sortedDates, setSortedDates] = useState([]);
  const [isCalendarRenderComplete, setIsCalendarRenderComplete] = useState(false);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const startTimeCustomWatch = Form.useWatch('startTimeCustom', form);
  const endTimeCustomWatch = Form.useWatch('endTimeCustom', form);

  const screens = useBreakpoint();

  const iconcolor = {
    color: '#1B3DE6',
  };
  const handleDateSort = (array) => {
    const sortedArray = array?.sort(
      (a, b) => new moment(a?.initDate).format('YYYYMMDD') - new moment(b?.initDate).format('YYYYMMDD'),
    );
    return sortedArray;
  };
  const handleSubmit = (values) => {
    const formattedStartTime = moment(values.startTimeCustom).format('hh:mm a');
    const formattedEndTime = values.endTimeCustom ? moment(values.endTimeCustom).format('hh:mm a') : null;
    const formattedStart = moment(values.startTimeCustom).format('HH:mm');
    const formattedEnd = values.endTimeCustom ? moment(values.endTimeCustom).format('HH:mm') : null;

    const newTimeEntry = {
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      start: formattedStart,
      end: formattedEnd,
      color: '#607EFC',
      id: uniqid(),
    };

    setDataSource(
      dateSource.map((item) => {
        if (updateAllTime || selectedDateId === item.id) {
          const updatedTimes = [...(item.time || []), newTimeEntry]
            .filter((time) => time.start || time.startTime || time.end || time.endTime)
            .sort((a, b) => a.start.localeCompare(b.start));

          return { ...item, time: updatedTimes };
        }
        return item;
      }),
    );

    form.resetFields();
    setShowAddTime(false);
    setSelectedDateId('-100');
    setUpdateAllTime(false);
  };

  useEffect(() => {
    const getMonthSorted = handleDateSort(dateSource?.filter((date) => !date?.isDeleted));
    setSortedDates(getMonthSorted);
    let numTimes = 0;
    dateSource?.map((date) => {
      if (!date?.isDeleted) numTimes = numTimes + (date?.time?.length ?? 0);
    });
    setNumberOfTimes(numTimes);
    setSubEventCount(subEventsCountHandler(dateSource));
  }, [dateSource]);

  useEffect(() => {
    if (isModalVisible) {
      setDataSource(customDates);

      if (defaultSelectedStartDate && (!customDates || customDates.length === 0)) {
        const obj = {
          id: uniqid(),
          name: 'test name',
          location: 'test Location',
          startDate: defaultSelectedStartDate,
          endDate: defaultSelectedStartDate,
          initDate: moment(defaultSelectedStartDate),
          isDeleted: false,
          color: '#607EFC',
        };
        setTest(obj);
      }
    }
  }, [isModalVisible]);

  useEffect(() => {
    const el1 = document.getElementsByClassName(selectedDateId);
    if (el1) el1[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [selectedDateId]);

  const handleOk = () => {
    setCustomDates(dateSource);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setDataSource([]);
    setIsModalVisible(false);
  };
  useEffect(() => {
    if (isCalendarRenderComplete) {
      let month;
      const getMonthSorted = handleDateSort(dateSource?.filter((date) => !date?.isDeleted));
      if (getMonthSorted?.length > 0) month = moment(getMonthSorted[0]?.initDate).format('MMMM');
      else month = moment().format('MMMM');
      month = moment().month(month).format('M');
      month = month - 1;
      const el1 = document.querySelector(`[data-month-id="${month}"]`);
      if (el1) el1?.scrollIntoView({ block: 'center' });
    }
  }, [isCalendarRenderComplete]);

  useEffect(() => {
    if (test) {
      if (dateSource.find((item) => item.initDate === test.initDate)) {
        setDataSource(
          dateSource.map((item) => {
            if (item.initDate === test.initDate) item.isDeleted ? (item.isDeleted = false) : (item.isDeleted = true);

            return item;
          }),
        );
      } else setDataSource([...dateSource, test].sort((a, b) => (b.initDate < a.initDate ? 1 : -1)));

      setTest(null);
    }
  }, [test]);

  useEffect(() => {
    if (dateArrayCal) {
      if (dateArrayCal.length > 1) {
        const checkDateExisting = dateSource.map((item) => item.initDate);
        const newCopyArray = dateArrayCal.filter((item) => !checkDateExisting.includes(item.initDate));

        const iterated = [...dateSource, [].concat.apply([], newCopyArray)];
        setDataSource([].concat.apply([], iterated).sort((a, b) => (b.initDate < a.initDate ? 1 : -1)));
      }
      setDateArrayCal(null);
    }
  }, [dateArrayCal]);

  const deleteEvent = (event) => {
    setDataSource(
      dateSource.map((item) => {
        if (event.id === item.id) item.isDeleted = true;
        return item;
      }),
    );
  };
  const deleteEventPermenent = (event) => {
    setDataSource(dateSource.filter((item) => event.id !== item.id));
  };
  const redoEvent = (event) => {
    setDataSource(
      dateSource.map((item) => {
        if (event.id === item.id) item.isDeleted = false;
        return item;
      }),
    );
  };

  const copyEvents = (event) => {
    setSelectedCopyTime(event);
    setCopyModal(true);
  };

  const onChangeCheckbox = (e) => {
    if (e.target.checked) setUpdateAllTime(true);
    else setUpdateAllTime(false);
  };

  const deleteTime = (event, id) => {
    setDataSource(
      dateSource.map((item) => {
        const obj = {
          ...item,
          time: event.id === item.id ? item.time.filter((eventTime) => eventTime.id !== id) : item.time,
        };

        return obj;
      }),
    );
  };

  const dateConverter = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const paddedDay = String(day).padStart(2, '0');
    const paddedMonth = String(month).padStart(2, '0');

    const formattedDate = `${paddedDay}/${paddedMonth}/${year}`;
    return moment(formattedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
  };

  const getNumberOfDays = async (start, end) => {
    let startDate = dateConverter(start);
    let endDate = dateConverter(end);
    let date = [];

    for (var m = moment(startDate); m.isSameOrBefore(endDate); m.add(1, 'days')) {
      date.push(m.format('YYYY-MM-DD'));
    }

    return date;
  };
  return (
    <CustomModal
      maskClosable
      closable={false}
      onCancel={() => setIsModalVisible(false)}
      title={
        <div className="custom-modal-title-wrapper">
          <span className="custom-modal-title-heading" data-cy="span-recurring-title">
            {t('dashboard.events.addEditEvent.dates.modal.titleHeading')}
          </span>
          <div className="custom-modal-title-right-contents">
            <span className="custom-modal-title-heading" data-cy="span-recurring-start-date-end-date-title">
              {sortedDates?.length > 0 &&
                moment(sortedDates[0]?.initDate).locale(i18n.language).format('MMMM DD, YYYY')}
              {sortedDates?.length > 1 &&
                '-' +
                  moment(sortedDates[sortedDates?.length - 1]?.initDate)
                    .locale(i18n.language)
                    .format('MMMM DD, YYYY')}
            </span>
            <Tags style={{ color: '#1572BB', borderRadius: '4px' }} color={'#DBF3FD'}>
              {pluralize(subEventCount, t('dashboard.events.list.event'))}
            </Tags>
          </div>
        </div>
      }
      open={isModalVisible}
      className="recurring-modal"
      width={800}
      footer={[
        <TextButton
          key="cancel"
          size="large"
          label={t('dashboard.events.addEditEvent.dates.cancel')}
          onClick={handleCancel}
          data-cy="button-cancel-custom-dates"
        />,
        <PrimaryButton
          key="add-dates"
          label={t('dashboard.events.addEditEvent.dates.addDates')}
          onClick={handleOk}
          data-cy="button-save-custom-dates"
        />,
      ]}
      bodyStyle={{ padding: '0px' }}>
      <Row>
        <Col style={!screens.sm ? { padding: '16px' } : { padding: '24px' }}>
          {isModalVisible && (
            <Calendar
              className="recurring-cal"
              style="background"
              language={i18n.language?.toLowerCase()}
              minDate={null}
              year={sortedDates?.length > 0 ? moment(sortedDates[0]?.initDate).year() : moment().year()}
              enableRangeSelection={true}
              onRangeSelected={async (e) => {
                const dateLength = await getNumberOfDays(e.startDate, e.endDate);
                if (dateLength && dateLength.length > 1) {
                  const dateArray = dateLength.map((item) => {
                    const date = moment(item, 'YYYY-MM-DD');
                    const obj = {
                      id: uniqid(),
                      name: 'test name',
                      location: 'test Location',
                      startDate: date.toDate(),
                      endDate: date.toDate(),
                      initDate: date.format('YYYY-MM-DD'),
                      isDeleted: false,
                      color: '#607EFC',
                    };
                    return obj;
                  });
                  setDateArrayCal(dateArray);
                } else {
                  const obj = {
                    id: uniqid(),
                    name: 'test name',
                    location: 'test Location',
                    startDate: e.startDate,
                    endDate: e.endDate,
                    initDate: moment(e.startDate).format('YYYY-MM-DD'),
                    isDeleted: false,
                    color: '#607EFC',
                  };
                  setTest(obj);
                }
              }}
              dataSource={dateSource.filter((item) => !item.isDeleted)}
              onRenderEnd={() => {
                setIsCalendarRenderComplete(true);
              }}
              data-cy="calendar-custom-dates"
            />
          )}
        </Col>
        <Col>
          <Divider type="vertical" style={{ height: '100%' }} />
        </Col>
        <Col flex="auto" className="custom-date-column" style={{ padding: '24px' }}>
          <div>
            {dateSource.map((item) => (
              <div key={item.id}>
                <div className="custom-time-layout">
                  <div
                    className={item.isDeleted ? 'deleted-text custom-no-of-date' : 'custom-no-of-date'}
                    data-cy="div-display-cutstom-start-date">
                    {moment(item?.initDate)
                      .locale(i18n.language)
                      .format(currentLang === 'en' ? 'ddd, MMMM DD, YYYY' : currentLang === 'fr' && 'ddd DD MMMM YYYY')}
                  </div>
                  <div className="crud-icons">
                    {item.isDeleted ? (
                      <UndoOutlined onClick={() => redoEvent(item)} style={iconcolor} data-cy="icon-undo-change" />
                    ) : (
                      <CopyOutlined
                        onClick={() => {
                          if (item.time && item.time.length > 0) copyEvents(item);
                        }}
                        style={iconcolor}
                        data-cy="icon-copy-custom-date"
                      />
                    )}
                    {item.isDeleted ? (
                      <DeleteFilled
                        onClick={() => deleteEventPermenent(item)}
                        style={iconcolor}
                        data-cy="icon-delete-custom-date-permanent"
                      />
                    ) : (
                      <DeleteOutlined
                        onClick={() => deleteEvent(item)}
                        style={iconcolor}
                        data-cy="icon-delete-custom-date"
                      />
                    )}
                  </div>
                </div>

                {!item?.isDeleted &&
                  item?.time &&
                  item?.time?.map((customTime, index) => (
                    <div className="custom-time-layout" style={{ margin: '9px' }} key={index}>
                      <div data-cy="div-display-cutstom-time">
                        {customTime?.startTime &&
                          moment(customTime?.startTime, 'hh:mm a').format(
                            i18n.language === 'en' ? 'hh:mm a' : i18n.language === 'fr' && 'HH:mm',
                          )}
                        {customTime?.endTime && customTime?.startTime ? ' - ' : ''}
                        {customTime?.endTime &&
                          moment(customTime?.endTime, 'hh:mm a').format(
                            i18n.language === 'en' ? 'hh:mm a' : i18n.language === 'fr' && 'HH:mm',
                          )}
                      </div>
                      {(customTime?.startTime || customTime?.startTime) && (
                        <div>
                          <CloseOutlined
                            className="close-time"
                            onClick={() => deleteTime(item, customTime.id)}
                            data-cy="icon-delete-custom-time"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                {!item.isDeleted && selectedDateId !== item.id && (
                  <TextButton
                    icon={<PlusOutlined style={{ color: '#1B3DE6' }} />}
                    label={t('dashboard.events.addEditEvent.dates.modal.addTime')}
                    onClick={() => {
                      setShowAddTime(true);
                      setSelectedDateId(item.id);
                    }}
                    data-cy="button-add-custom-time"
                  />
                )}

                {!item.isDeleted && showAddTime && selectedDateId === item.id && (
                  <Form
                    form={form}
                    layout="vertical"
                    className="update-status-form"
                    data-testid="status-update-form"
                    onFinish={handleSubmit}>
                    <Row justify="space-between">
                      <Col flex={'165px'}>
                        <Form.Item
                          name="startTimeCustom"
                          label={t('dashboard.events.addEditEvent.dates.startTime')}
                          data-cy="custom-start-time-label">
                          <TimePickerStyled
                            placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                            use12Hours={i18n?.language === 'en' ? true : false}
                            format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                            getPopupContainer={null}
                            onSelect={(value) => {
                              form.setFieldsValue({
                                startTimeCustom: value,
                                endTimeCustom: value ? form.getFieldValue('endTimeCustom') : undefined,
                              });
                            }}
                            onChange={(value) => {
                              if (!value) {
                                form.setFieldsValue({
                                  endTimeCustom: null,
                                });
                              }
                            }}
                            data-cy="custom-start-time"
                          />
                        </Form.Item>
                      </Col>
                      <Col flex={'165px'}>
                        <Form.Item
                          name="endTimeCustom"
                          label={t('dashboard.events.addEditEvent.dates.endTime')}
                          data-cy="custom-end-time-label">
                          <TimePickerStyled
                            placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                            use12Hours={i18n?.language === 'en' ? true : false}
                            format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                            getPopupContainer={null}
                            onSelect={(value) => {
                              form.setFieldsValue({
                                endTimeCustom: value,
                              });
                            }}
                            disabled={form.getFieldValue('startTimeCustom') ? false : true}
                            data-cy="custom-end-time"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <div className="flex-align">
                      <Checkbox
                        onChange={onChangeCheckbox}
                        className="check-time"
                        checked={updateAllTime}
                        data-cy="checkbox-add-time-to-all-dates">
                        {t('dashboard.events.addEditEvent.dates.modal.addTimeToAllDates')}
                      </Checkbox>
                      <div>
                        <Form.Item className={`add-time-items  ${selectedDateId}`}>
                          <TextButton
                            key="cancel"
                            size="large"
                            label={t('dashboard.events.addEditEvent.dates.cancel')}
                            onClick={() => {
                              form.resetFields();
                              setShowAddTime(false);
                              setSelectedDateId(null);
                            }}
                            data-cy="button-cancel-custom-add-time-to-all-dates"
                          />
                          <PrimaryButton
                            key="add-time"
                            htmlType="submit"
                            size="large"
                            disabled={startTimeCustomWatch || endTimeCustomWatch ? false : true}
                            label={t('dashboard.events.addEditEvent.dates.modal.add')}
                            data-cy="button-save-custom-add-time-to-all-dates"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </Form>
                )}
                <Divider />
              </div>
            ))}
            {dateSource.length === 0 && <Empty description={'No date selected'} />}
          </div>
        </Col>
      </Row>
      <CopyTimeModal
        isModalVisible={copyModal}
        setIsModalVisible={setCopyModal}
        currentLang={currentLang}
        recurringEvents={dateSource}
        copyTime={selectedCopyTime}
        updateTime={setDataSource}
      />
    </CustomModal>
  );
};

export default RecurringModal;
