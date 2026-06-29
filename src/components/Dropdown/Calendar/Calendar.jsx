import React, { useState, useCallback, useEffect, useRef } from 'react';
import './calendar.css';
import { Dropdown, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedCalendar } from '../../../redux/reducer/selectedCalendarSlice';
import { PathName } from '../../../constants/pathName';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { useLazyGetAllCalendarsQuery } from '../../../services/calendar';

const ITEMS_PER_PAGE = 8;

function Calendar({ children, allCalendarsData, setPageNumber }) {
  const dispatch = useDispatch();
  const { user } = useSelector(getUserDetails);
  const calendarIdInCookies = sessionStorage.getItem('calendarId');
  const [getAllCalendars, { isFetching }] = useLazyGetAllCalendarsQuery();

  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [serverCalendars, setServerCalendars] = useState([]);
  const [serverCount, setServerCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const listRef = useRef(null);

  const allCalendars = allCalendarsData?.data ?? [];
  const isSearching = searchQuery !== '';

  const displayCalendars = isSearching ? serverCalendars : allCalendars;
  const hasMore = isSearching ? currentPage * ITEMS_PER_PAGE < serverCount : false;

  const loadPage = useCallback(
    async (page, search, append = false) => {
      try {
        const result = await getAllCalendars({
          page,
          limit: ITEMS_PER_PAGE,
          ...(search && { search }),
        }).unwrap();
        const newData = result?.data ?? [];
        if (append) {
          setServerCalendars((prev) => [...prev, ...newData]);
        } else {
          setServerCalendars(newData);
        }
        setServerCount(result?.count ?? 0);
        setCurrentPage(page);
      } catch {
        if (!append) setServerCalendars([]);
      }
    },
    [getAllCalendars],
  );

  const debouncedSearch = useCallback(
    useDebounce((value) => {
      setSearchQuery(value);
      if (value) {
        loadPage(1, value, false);
      } else {
        setServerCalendars([]);
        setServerCount(0);
        setCurrentPage(1);
      }
    }, SEARCH_DELAY),
    [loadPage],
  );

  useEffect(() => {
    if (!open) {
      setSearchInput('');
      setSearchQuery('');
      setServerCalendars([]);
      setServerCount(0);
      setCurrentPage(1);
    }
  }, [open]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleItemClick = (key) => {
    if (calendarIdInCookies !== key) {
      dispatch(setSelectedCalendar(String(key)));
      sessionStorage.setItem('calendarId', key);
      setPageNumber(1);
      sessionStorage.clear();
      setOpen(false);
      const origin = window.location.origin;
      const newUrl = `${origin}${PathName.Dashboard}/${key}${PathName.Events}`;
      window.location.href = newUrl;
    }
  };

  const handleOpenChange = (flag) => {
    if (allCalendars.length > 1) setOpen(flag);
  };

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || !hasMore || isFetching) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      loadPage(currentPage + 1, searchQuery, true);
    }
  }, [hasMore, isFetching, loadPage, currentPage, searchQuery]);

  const renderDropdown = () => (
    <div className="calendar-dropdown-content" onClick={(e) => e.stopPropagation()}>
      <div className="calendar-search-wrapper">
        <Input
          className="calendar-search-input"
          prefix={<SearchOutlined className="calendar-search-icon" />}
          placeholder="Search calendars..."
          bordered={false}
          value={searchInput}
          onChange={handleSearchChange}
          autoFocus
        />
      </div>
      <div className="calendar-list-wrapper" ref={listRef} onScroll={handleScroll}>
        {displayCalendars.map((item) => {
          const name = contentLanguageBilingual({
            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
            calendarContentLanguage: item?.contentLanguage,
            data: item?.name,
          });
          return (
            <div key={item.id} className="calendar-dropdown-item" onClick={() => handleItemClick(item.id)}>
              <img className="calendar-item-logo" src={item?.logo?.original?.uri} alt="" />
              <span className="calendar-item-name">{name}</span>
            </div>
          );
        })}
        {isFetching && <div className="calendar-load-more-indicator">Loading...</div>}
        {!displayCalendars.length && !isFetching && <div className="calendar-empty-state">No calendars found</div>}
      </div>
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={handleOpenChange}
      trigger={['click']}
      overlayClassName="calendar-dropdown-overlay"
      dropdownRender={renderDropdown}
      getPopupContainer={(trigger) => trigger.parentNode}>
      {children}
    </Dropdown>
  );
}

export default Calendar;
