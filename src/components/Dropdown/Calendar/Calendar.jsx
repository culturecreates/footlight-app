import React, { useState } from 'react';
import './calendar.css';
import { Dropdown } from 'antd';
import { useDispatch } from 'react-redux';
import { setSelectedCalendar } from '../../../redux/reducer/selectedCalendarSlice';
import { PathName } from '../../../constants/pathName';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import Cookies from 'js-cookie';

function Calendar({ children, allCalendarsData, setPageNumber }) {
  const dispatch = useDispatch();
  const { user } = useSelector(getUserDetails);
  const calendarIdInCookies = Cookies.get('calendarId');

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
            objectFit: 'contain',
          }}
          src={item?.image?.uri}
        />
      ),
    };
  });
  const onClick = ({ key }) => {
    if (calendarIdInCookies != key) {
      dispatch(setSelectedCalendar(String(key)));
      Cookies.set('calendarId', key);
      setPageNumber(1);
      sessionStorage.clear();
      setOpen(false);
      const origin = window.location.origin;
      const newUrl = `${origin}${PathName.Dashboard}/${key}${PathName.Events}`;
      window.location.href = newUrl;
    }
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
      trigger={['click']}
      overlayClassName="calendar-dropdown">
      {children}
    </Dropdown>
  );
}

export default Calendar;
