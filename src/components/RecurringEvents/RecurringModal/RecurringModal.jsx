import { Col, Divider, Row, Form, Checkbox, Empty } from 'antd';
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

const RecurringModal = ({
  isModalVisible,
  setIsModalVisible,
  currentLang,
  setCustomDates,
  customDates,
  // numberOfTimes,
  setNumberOfTimes,
  // isCustom,
  // parentForm,
  // parentSetFormState,
  subEventCount,
  setSubEventCount,
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

  const iconcolor = {
    color: '#1B3DE6',
  };
  const handleDateSort = (array) => {
    const sortedArray = array?.sort(
      (a, b) => new moment(a?.startDate).format('YYYYMMDD') - new moment(b?.startDate).format('YYYYMMDD'),
    );
    return sortedArray;
  };
  const handleSubmit = (values) => {
    const obj = {
      startTime: moment(values.startTimeCustom).format('hh:mm a'),
      endTime: values.endTimeCustom && moment(values.endTimeCustom).format('hh:mm a'),
      start: moment(values.startTimeCustom).format('HH:mm'),
      end: values.endTimeCustom && moment(values.endTimeCustom).format('HH:mm'),
      color: '#607EFC',
    };

    if (updateAllTime) {
      setDataSource(
        dateSource.map((item) => ({
          ...item,
          time: item.time ? [...item.time, obj]?.sort((a, b) => a?.startTime?.localeCompare(b?.startTime)) : [obj],
        })),
      );
    } else
      setDataSource(
        dateSource.map((item) => {
          if (selectedDateId === item.id) {
            if (item.time) item.time = [...item.time, obj]?.sort((a, b) => a?.start?.localeCompare(b?.start));
            else item.time = [obj];
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
    // let month = moment(getMonthSorted[0]?.initDate).format('MMMM');
    // month = moment().month(month).format('M');
    // month = month - 1;
    // const el1 = document.querySelector(`[data-month-id="${month}"]`);
    // if (el1) el1?.scrollIntoView();
    let numTimes = 0;
    dateSource?.map((date) => {
      if (!date?.isDeleted) numTimes = numTimes + (date?.time?.length ?? 0);
    });
    setNumberOfTimes(numTimes);
    setSubEventCount(subEventsCountHandler(dateSource));
  }, [dateSource]);

  useEffect(() => {
    setDataSource(customDates);
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
      } else setDataSource([...dateSource, test].sort((a, b) => (b.startDate < a.startDate ? 1 : -1)));
      setTest(null);
    }
  }, [test]);

  useEffect(() => {
    if (dateArrayCal) {
      if (dateArrayCal.length > 1) {
        const checkDateExisting = dateSource.map((item) => item.initDate);
        const newCopyArray = dateArrayCal.filter((item) => !checkDateExisting.includes(item.initDate));

        const iterated = [...dateSource, [].concat.apply([], newCopyArray)];
        setDataSource([].concat.apply([], iterated).sort((a, b) => (b.startDate < a.startDate ? 1 : -1)));
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

  const deleteTime = (event, start) => {
    setDataSource(
      dateSource.map((item) => {
        const obj = {
          ...item,
          time: event.id === item.id ? item.time.filter((eventTime) => eventTime.startTime !== start) : item.time,
        };

        return obj;
      }),
    );
  };

  const getNumberOfDays = async (start, end) => {
    let date = [];

    for (var m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
      date.push(m.format('DD/MM/YYYY'));
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
          <span className="custom-modal-title-heading">
            {t('dashboard.events.addEditEvent.dates.modal.titleHeading')}
          </span>
          <div className="custom-modal-title-right-contents">
            <span className="custom-modal-title-heading">
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
        />,
        <PrimaryButton key="add-dates" label={t('dashboard.events.addEditEvent.dates.addDates')} onClick={handleOk} />,
      ]}
      bodyStyle={{ padding: '0px' }}>
      <Row>
        <Col style={{ padding: '24px' }}>
          {/* <MultipleDatePicker /> */}
          {isModalVisible && (
            <Calendar
              className="recurring-cal"
              style="background"
              language={i18n.language?.toLowerCase()}
              minDate={null}
              year={sortedDates?.length > 0 ? moment(sortedDates[0]?.initDate).year() : moment().year()}
              enableRangeSelection={true}
              //  onRangeSelected={e =>selectDate(e) }
              onRangeSelected={async (e) => {
                const dateLength = await getNumberOfDays(e.startDate, e.endDate);

                if (dateLength && dateLength.length > 1) {
                  const dateArray = dateLength.map((item) => {
                    const date = moment(item, 'DD/MM/YYYY');

                    const obj = {
                      id: uniqid(),
                      name: 'test name',
                      location: 'test Location',
                      startDate: new Date(date.format('YYYY,M,D')),
                      endDate: new Date(date.format('YYYY,M,D')),
                      initDate: moment(date).format('YYYY-MM-DD'),
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
                  <div className={item.isDeleted ? 'deleted-text custom-no-of-date' : 'custom-no-of-date'}>
                    {moment(item.startDate).locale(i18n.language).format('MMMM DD, YYYY')}
                  </div>
                  <div className="crud-icons">
                    {item.isDeleted ? (
                      <UndoOutlined onClick={() => redoEvent(item)} style={iconcolor} />
                    ) : (
                      <CopyOutlined
                        onClick={() => {
                          if (item.time && item.time.length > 0) copyEvents(item);
                        }}
                        style={iconcolor}
                      />
                    )}
                    {item.isDeleted ? (
                      <DeleteFilled onClick={() => deleteEventPermenent(item)} style={iconcolor} />
                    ) : (
                      <DeleteOutlined onClick={() => deleteEvent(item)} style={iconcolor} />
                    )}
                  </div>
                </div>

                {!item?.isDeleted &&
                  item?.time &&
                  item?.time?.map((customTime, index) => (
                    <div className="custom-time-layout" style={{ margin: '9px' }} key={index}>
                      <div>
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
                            onClick={() => deleteTime(item, customTime.startTime)}
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
                          //   className="status-comment-item"
                          label={t('dashboard.events.addEditEvent.dates.startTime')}>
                          <TimePickerStyled
                            placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                            use12Hours={i18n?.language === 'en' ? true : false}
                            format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                            onSelect={(value) => {
                              form.setFieldsValue({
                                startTimeCustom: value,
                              });
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col flex={'165px'}>
                        <Form.Item
                          name="endTimeCustom"
                          //   className="status-comment-item"
                          label={t('dashboard.events.addEditEvent.dates.endTime')}>
                          <TimePickerStyled
                            placeholder={t('dashboard.events.addEditEvent.dates.timeFormatPlaceholder')}
                            use12Hours={i18n?.language === 'en' ? true : false}
                            format={i18n?.language === 'en' ? 'h:mm a' : 'HH:mm'}
                            onSelect={(value) => {
                              form.setFieldsValue({
                                endTimeCustom: value,
                              });
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <div className="flex-align">
                      <Checkbox onChange={onChangeCheckbox} className="check-time" checked={updateAllTime}>
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
                          />
                          <PrimaryButton
                            key="add-time"
                            htmlType="submit"
                            size="large"
                            disabled={startTimeCustomWatch || endTimeCustomWatch ? false : true}
                            label={t('dashboard.events.addEditEvent.dates.modal.add')}
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
