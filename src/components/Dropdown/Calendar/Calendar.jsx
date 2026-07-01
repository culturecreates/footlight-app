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
import LoadingIndicator from '../../LoadingIndicator';

const ITEMS_PER_PAGE = 10;

function Calendar({ children, setPageNumber }) {
  const dispatch = useDispatch();
  const { user } = useSelector(getUserDetails);
  const calendarIdInCookies = sessionStorage.getItem('calendarId');
  const [getAllCalendars, { isFetching }] = useLazyGetAllCalendarsQuery();

  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [calendars, setCalendars] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const listRef = useRef(null);
  const loadingRef = useRef(false);

  const hasMore = currentPage * ITEMS_PER_PAGE < totalCount;

  const loadPage = useCallback(
    async (page, search, append = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      try {
        const result = await getAllCalendars({
          page,
          limit: ITEMS_PER_PAGE,
          sort: 'asc(name)',
          ...(search && { search }),
        }).unwrap();
        const newData = result?.data ?? [];
        if (append) {
          setCalendars((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const uniqueNew = newData.filter((c) => !existingIds.has(c.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setCalendars(newData);
        }
        setTotalCount(result?.count ?? 0);
        setCurrentPage(page);
      } catch {
        if (!append) setCalendars([]);
      } finally {
        loadingRef.current = false;
      }
    },
    [getAllCalendars],
  );

  const debouncedSearch = useCallback(
    useDebounce((value) => {
      setSearchQuery(value);
      loadPage(1, value, false);
    }, SEARCH_DELAY),
    [loadPage],
  );

  useEffect(() => {
    if (open) {
      loadPage(1, '', false);
    } else {
      setSearchInput('');
      setSearchQuery('');
      setCalendars([]);
      setTotalCount(0);
      setCurrentPage(1);
    }
  }, [open, loadPage]);

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
    setOpen(flag);
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
        {calendars.map((item) => {
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
        {isFetching && (
          <div className="calendar-load-more-indicator">
            <LoadingIndicator />
          </div>
        )}
        {!calendars.length && !isFetching && <div className="calendar-empty-state">No calendars found</div>}
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
