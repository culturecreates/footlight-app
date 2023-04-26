import React, { useState } from 'react';
import './calendar.css';
import { Dropdown } from 'antd';
import { useDispatch } from 'react-redux';
import { setSelectedCalendar } from '../../../redux/reducer/selectedCalendarSlice';
import { useNavigate } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import Cookies from 'js-cookie';

function Calendar({ children, allCalendarsData, setPageNumber }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(getUserDetails);

  const [open, setOpen] = useState(false);
  const items = allCalendarsData?.data?.map((item) => {
    const key = item?.id;
    return {
      label: (
        <span className="calendar-name-wrapper">
          <span className="calendar-name">
            {contentLanguageBilingual({
              en: item?.name?.en,
              fr: item?.name?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: item?.contentLanguage,
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
    setPageNumber(1);
    Cookies.remove('page');
    Cookies.remove('query');
    Cookies.remove('order');
    Cookies.remove('sortBy');
    Cookies.remove('users');
    Cookies.remove('publication');
    Cookies.remove('start-date-range');
    Cookies.remove('end-date-range');
    setOpen(false);
  };

  const handleOpenChange = (flag) => {
    if (allCalendarsData?.data?.length > 1) setOpen(flag);
  };
  return (
    <Dropdown
      menu={{
        items,
        onClick,
      }}
      open={open}
      onOpenChange={handleOpenChange}
      trigger={['click']}>
      {children}
    </Dropdown>
  );
}

export default Calendar;
