import React, { useMemo } from 'react';
import { Tooltip } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import Link from 'antd/lib/typography/Link';
import moment from 'moment-timezone';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { sameAsTypes } from '../../constants/sameAsTypes';
import { ARTSDATA_RESOURCE_PREFIX } from '../../utils/artsDataLinkChecker';
import './subEventsList.css';

const DEFAULT_TIMEZONE = 'Canada/Eastern';

// The Artsdata URI of a sub-event, if it has one: an ArtsdataIdentifier pointing at kg.artsdata.ca/resource/
export const getSubEventArtsdataUri = (subEvent) =>
  subEvent?.sameAs?.find(
    (item) => item?.type === sameAsTypes.ARTSDATA_IDENTIFIER && item?.uri?.startsWith(ARTSDATA_RESOURCE_PREFIX),
  )?.uri;

const hasTime = (subEvent) => !!subEvent?.startDateTime;

function SubEventsList({ subEvents = [], timezone = DEFAULT_TIMEZONE }) {
  const { t } = useTranslation();
  const timeFormat = i18n?.language === 'en' ? 'h:mm a' : 'HH:mm';

  const sortedSubEvents = useMemo(
    () =>
      [...subEvents].sort((a, b) =>
        moment(a?.startDateTime ?? a?.startDate).diff(moment(b?.startDateTime ?? b?.startDate)),
      ),
    [subEvents],
  );

  if (!sortedSubEvents.length) return null;

  return (
    <div className="sub-events-list" data-cy="list-sub-events">
      {sortedSubEvents.map((subEvent, index) => {
        const subEventTimezone = subEvent?.scheduleTimezone ?? timezone;
        const start = moment.tz(subEvent?.startDateTime ?? subEvent?.startDate, subEventTimezone);
        const artsdataUri = getSubEventArtsdataUri(subEvent);

        return (
          <div className="sub-events-list-item" key={subEvent?.id ?? index} data-cy="list-item-sub-event">
            <span className="sub-events-list-date">{start.locale(i18n?.language).format('DD-MMM-YYYY')}</span>
            <span className="sub-events-list-time">
              {hasTime(subEvent) && (
                <>
                  {start.format(timeFormat)}
                  {subEvent?.endDateTime && (
                    <>
                      &nbsp;-&nbsp;
                      {moment.tz(subEvent?.endDateTime, subEventTimezone).format(timeFormat)}
                    </>
                  )}
                </>
              )}
            </span>
            <span className="sub-events-list-link">
              {artsdataUri && (
                <Tooltip title={t('dashboard.events.list.viewInArtsdata')}>
                  <Link
                    className="sub-events-artsdata-pill"
                    data-cy="sub-event-artsdata-link"
                    href={artsdataUri}
                    target="_blank"
                    rel="noopener noreferrer">
                    <span className="sub-events-artsdata-pill-text">{t('dashboard.events.list.artsdata')}</span>
                    <LinkOutlined style={{ fontSize: '14px' }} />
                  </Link>
                </Tooltip>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default SubEventsList;
