import { Checkbox, Modal } from 'antd';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import '../recurringEvents.css';
import CustomModal from '../../Modal/Common/CustomModal';
import { useTranslation } from 'react-i18next';
import TextButton from '../../Button/Text';
import PrimaryButton from '../../Button/Primary';
import i18next from 'i18next';

const { confirm } = Modal;

const CopyTimeModal = ({ isModalVisible, setIsModalVisible, recurringEvents, copyTime, updateTime }) => {
  const { t } = useTranslation();
  const [checkOptions, setCheckOptions] = useState([]);
  const [selectedCheckbox, setSelectedCheckbox] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const handleOk = () => {
    const newCopyArray = recurringEvents.filter((item) => {
      if (selectedCheckbox.includes(item.id)) item.time = copyTime.time;
      return item;
    });
    updateTime(newCopyArray);

    setIsModalVisible(false);
    setCheckAll(false);
    setSelectedCheckbox([]);
  };

  const onChange = (checkedValues) => {
    setSelectedCheckbox(checkedValues);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  useEffect(() => {
    if (copyTime)
      setCheckOptions(
        recurringEvents
          .filter((item) => item.id !== copyTime.id)
          .map((item) => {
            const obj = {
              label: moment(item.startDate).locale(i18next.language).format('dddd DD MMM YYYY'),
              value: item.id,
            };
            return obj;
          }),
      );
  }, [recurringEvents, copyTime]);

  const onCheckAllChange = (e) => {
    setSelectedCheckbox(e.target.checked ? recurringEvents.map((item) => item.id) : []);

    setCheckAll(e.target.checked);
  };

  const showConfirm = () => {
    confirm({
      title: 'Are you sure?',
      icon: <ExclamationCircleOutlined />,
      content: t('dashboard.events.addEditEvent.dates.modal.addTimeToAllDatesWarning'),
      okText: 'Ok',
      cancelText: t('dashboard.events.addEditEvent.dates.cancel'),
      onOk() {
        handleOk();
      },

      onCancel() {},
    });
  };
  return (
    <CustomModal
      title={
        <div className="custom-modal-title-wrapper">
          <span className="custom-modal-title-heading">
            {t('dashboard.events.addEditEvent.dates.modal.titleHeading')}
          </span>
        </div>
      }
      open={isModalVisible}
      footer={[
        <TextButton
          key="cancel"
          size="large"
          label={t('dashboard.events.addEditEvent.dates.cancel')}
          onClick={handleCancel}
        />,
        <PrimaryButton
          key="add-dates"
          label={t('dashboard.events.addEditEvent.dates.addDates')}
          onClick={showConfirm}
        />,
      ]}
      className="copy-modal">
      {copyTime &&
        copyTime.time &&
        copyTime.time.map((customTime, index) => (
          <div className="replace-txt" key={index}>
            {customTime.startTime && customTime.startTime + '-'}
            {customTime.endTime && customTime.endTime}
          </div>
        ))}
      <div className="replace-txt">Replace existing times on the following dates:</div>
      <div>
        <Checkbox.Group className="copycheck" options={checkOptions} onChange={onChange} value={selectedCheckbox} />
      </div>
      <Checkbox onChange={onCheckAllChange} checked={checkAll} className="select-all-check">
        {checkAll ? 'Unselect All' : 'Select All'}
      </Checkbox>
    </CustomModal>
  );
};
export default CopyTimeModal;
