import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import './calendar.css';
import { Dropdown, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedCalendar } from '../../../redux/reducer/selectedCalendarSlice';
import { PathName } from '../../../constants/pathName';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { useLazyGetAllCalendarsQuery } from '../../../services/calendar';
import LoadingIndicator from '../../LoadingIndicator';

const hashString = (value = '') => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return String(hash >>> 0);
};

const getUserIdentity = (user) => {
  if (!user) return 'anonymous';

  return (
    user?.id || user?._id || user?.userId || user?.email || user?.userName || user?.preferredUsername || 'unknown-user'
  );
};

const getCalendarCacheKey = ({ user, accessToken }) => {
  const identity = getUserIdentity(user);
  const tokenHash = hashString(accessToken || 'no-token');

  return `calendar:${identity}:${tokenHash}`;
};

const ITEMS_PER_PAGE = 8;
const CACHE_DURATION = 5 * 60 * 1000;

const normalizeForSearch = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

function Calendar({ children, setPageNumber, allCalendarsData }) {
  const { t } = useTranslation();
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
  const loadingMoreRef = useRef(false);
  const activeRequestRef = useRef(null);
  const inFlightPageKeysRef = useRef(new Set());
  const loadedPageKeysRef = useRef(new Set());
  const latestRequestIdRef = useRef(0);
  const cacheRef = useRef(new Map());
  const openRef = useRef(open);
  const latestStateRef = useRef({
    calendars: [],
    totalCount: 0,
    currentPage: 1,
    searchQuery: '',
  });

  const cacheKey = getCalendarCacheKey({
    user,
    accessToken: Cookies.get('accessToken'),
  });

  const hasMore = currentPage * ITEMS_PER_PAGE < totalCount;

  const filteredCalendars = useMemo(() => {
    const normalizedSearch = normalizeForSearch(searchQuery);
    if (!normalizedSearch) return calendars;

    return calendars.filter((item) => {
      const name = contentLanguageBilingual({
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        calendarContentLanguage: item?.contentLanguage,
        data: item?.name,
      });

      return normalizeForSearch(name).includes(normalizedSearch);
    });
  }, [calendars, searchQuery, user?.interfaceLanguage]);

  useEffect(() => {
    // Keep only the active identity's cache to avoid stale cross-user data in memory.
    cacheRef.current.forEach((_, key) => {
      if (key !== cacheKey) {
        cacheRef.current.delete(key);
      }
    });
  }, [cacheKey]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    latestStateRef.current = {
      calendars,
      totalCount,
      currentPage,
      searchQuery,
    };
  }, [calendars, totalCount, currentPage, searchQuery]);

  const loadPage = useCallback(
    async (page, search, append = false) => {
      const pageSearch = search || '';
      const pageKey = `${pageSearch}:${page}`;

      if (append && (inFlightPageKeysRef.current.has(pageKey) || loadedPageKeysRef.current.has(pageKey))) {
        return;
      }

      if (append && loadingMoreRef.current) return;
      if (!append && activeRequestRef.current?.abort) {
        activeRequestRef.current.abort();
      }

      const requestId = ++latestRequestIdRef.current;
      if (append) {
        loadingMoreRef.current = true;
      }
      inFlightPageKeysRef.current.add(pageKey);

      const request = getAllCalendars({
        page,
        limit: ITEMS_PER_PAGE,
        sort: 'asc(name.en)',
        ...(pageSearch && { search: pageSearch }),
      });
      activeRequestRef.current = request;

      try {
        const result = await request.unwrap();
        if (requestId !== latestRequestIdRef.current) return;

        const newData = result?.data ?? [];
        const newTotalCount = result?.count ?? 0;
        if (append) {
          setCalendars((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const uniqueNew = newData.filter((c) => !existingIds.has(c.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setCalendars(newData);
          if (!search) {
            cacheRef.current.set(cacheKey, {
              data: newData,
              totalCount: newTotalCount,
              currentPage: page,
              timestamp: Date.now(),
            });
          }
        }
        setTotalCount(newTotalCount);
        setCurrentPage(page);
        loadedPageKeysRef.current.add(pageKey);
      } catch (error) {
        const isAbort = error?.name === 'AbortError' || error?.message === 'Aborted';
        if (isAbort || requestId !== latestRequestIdRef.current) return;
        if (!append) setCalendars([]);
      } finally {
        inFlightPageKeysRef.current.delete(pageKey);
        if (append) {
          loadingMoreRef.current = false;
        }
        if (activeRequestRef.current === request) {
          activeRequestRef.current = null;
        }
      }
    },
    [cacheKey, getAllCalendars],
  );

  useEffect(() => {
    return () => {
      if (activeRequestRef.current?.abort) {
        activeRequestRef.current.abort();
      }
    };
  }, []);

  const debouncedSearch = useCallback(
    useDebounce((value) => {
      if (!openRef.current) return;
      setSearchQuery(value);
    }, SEARCH_DELAY),
    [],
  );

  useEffect(() => {
    if (!open || !searchQuery || isFetching || !hasMore || loadingMoreRef.current) return;
    if (!filteredCalendars.length) {
      loadPage(currentPage + 1, searchQuery, true);
    }
  }, [open, searchQuery, isFetching, hasMore, filteredCalendars.length, loadPage, currentPage]);

  useEffect(() => {
    const cachedData = cacheRef.current.get(cacheKey);

    if (open) {
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        setCalendars(cachedData.data);
        setTotalCount(cachedData.totalCount);
        setCurrentPage(cachedData.currentPage);
      } else if (allCalendarsData?.data) {
        setCalendars(allCalendarsData.data);
        setTotalCount(allCalendarsData.count ?? allCalendarsData.data.length);
        setCurrentPage(1);
        cacheRef.current.set(cacheKey, {
          data: allCalendarsData.data,
          totalCount: allCalendarsData.count ?? allCalendarsData.data.length,
          currentPage: 1,
          timestamp: Date.now(),
        });
      } else {
        loadPage(1, '', false);
      }
    } else {
      latestRequestIdRef.current += 1;
      if (activeRequestRef.current?.abort) {
        activeRequestRef.current.abort();
      }

      const latestState = latestStateRef.current;
      if (latestState.calendars.length && !latestState.searchQuery) {
        cacheRef.current.set(cacheKey, {
          data: latestState.calendars,
          totalCount: latestState.totalCount,
          currentPage: latestState.currentPage,
          timestamp: Date.now(),
        });
      }
      setSearchInput('');
      setSearchQuery('');
      inFlightPageKeysRef.current.clear();
      loadedPageKeysRef.current.clear();
      setCalendars([]);
      setTotalCount(0);
      setCurrentPage(1);
    }
  }, [allCalendarsData, cacheKey, loadPage, open]);

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

  const handleItemKeyDown = (event, key) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleItemClick(key);
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
          placeholder={t('dashboard.calendar.searchPlaceholder')}
          bordered={false}
          value={searchInput}
          onChange={handleSearchChange}
          autoFocus
        />
      </div>
      <div className="calendar-list-wrapper" ref={listRef} onScroll={handleScroll}>
        {filteredCalendars.map((item) => {
          const name = contentLanguageBilingual({
            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
            calendarContentLanguage: item?.contentLanguage,
            data: item?.name,
          });
          return (
            <div
              key={item.id}
              className="calendar-dropdown-item"
              role="button"
              tabIndex={0}
              onClick={() => handleItemClick(item.id)}
              onKeyDown={(event) => handleItemKeyDown(event, item.id)}>
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
        {!filteredCalendars.length && !isFetching && (
          <div className="calendar-empty-state">{t('dashboard.calendar.noCalendarsFound')}</div>
        )}
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
