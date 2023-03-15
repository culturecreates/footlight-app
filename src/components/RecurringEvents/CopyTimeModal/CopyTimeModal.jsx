import { Checkbox, Modal } from 'antd';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import '../recurringEvents.css';

const { confirm } = Modal;

const CopyTimeModal = ({ isModalVisible, setIsModalVisible, recurringEvents, copyTime, updateTime }) => {
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
              label: moment(item.startDate).format('dddd DD MMM YYYY'),
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
      content: ' This action cannot be undone.',

      onOk() {
        handleOk();
      },

      onCancel() {},
    });
  };
  return (
    <Modal
      title="Duplicate Times"
      open={isModalVisible}
      onOk={showConfirm}
      onCancel={handleCancel}
      className="copy-modal"
      okText="Done">
      {copyTime &&
        copyTime.time &&
        copyTime.time.map((customTime, index) => (
          <div className="replace-txt" key={index}>
            {customTime.startTime && customTime.startTime} - {customTime.endTime && customTime.endTime}{' '}
          </div>
        ))}
      <div className="replace-txt">Replace existing times on the following dates:</div>
      <Checkbox.Group className="copycheck" options={checkOptions} onChange={onChange} value={selectedCheckbox} />
      <Checkbox onChange={onCheckAllChange} checked={checkAll} className="select-all-check">
        {checkAll ? 'Unselect All' : 'Select All'}
      </Checkbox>
    </Modal>
  );
};
export default CopyTimeModal;
