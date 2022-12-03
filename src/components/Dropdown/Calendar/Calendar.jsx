import React from 'react';
import './calendar.css';
import { Dropdown } from 'antd';
import { useDispatch } from 'react-redux';
import { setSelectedCalendar } from '../../../redux/reducer/selectedCalendarSlice';
import { useNavigate } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { bilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';

function Calendar({ children, allCalendarsData }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(getUserDetails);

  const items = allCalendarsData?.data?.map((item) => {
    const key = item?.id;
    return {
      label: (
        <span className="calendar-name-wrapper">
          <span className="calendar-name">
            {bilingual({
              en: item?.name?.en,
              fr: item?.name?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
            })}
          </span>
        </span>
      ),
      key: key,
      icon: (
        <img
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '73px',
          }}
          src={item?.image?.uri}
        />
      ),
    };
  });
  const onClick = ({ key }) => {
    navigate(`${PathName.Dashboard}/${key}${PathName.Events}`);
    dispatch(setSelectedCalendar(String(key)));
  };

  return (
    <Dropdown
      menu={{
        items,
        onClick,
      }}
      trigger={['click']}>
      {children}
    </Dropdown>
  );
}

export default Calendar;
