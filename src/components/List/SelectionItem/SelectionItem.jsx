import React from 'react';
import './selectionItem.css';
import { Avatar, List, Button, Row, Col, Badge } from 'antd';
import { CloseCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';

function SelectionItem(props) {
  const {
    icon,
    name,
    description,
    bordered,
    closable,
    onClose,
    itemWidth,
    postalAddress,
    accessibility,
    openingHours,
    calendarContentLanguage,
    artsDataLink,
  } = props;
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);

  return (
    <div
      className="selection-item-wrapper"
      style={{ border: bordered && '1px solid#607EFC', width: itemWidth && itemWidth }}>
      <List.Item
        className="selection-item-list-wrapper"
        actions={[
          closable && (
            <Button type="text" key="list-loadmore-close" onClick={onClose} style={{ padding: '0px' }}>
              <CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '21px' }} />
            </Button>
          ),
        ]}>
        <List.Item.Meta
          style={{ alignItems: 'flex-start' }}
          avatar={
            <Avatar
              shape="square"
              size={'large'}
              icon={icon}
              style={{
                backgroundColor: '#E3E8FF',
                borderRadius: '4px',
              }}
            />
          }
          title={<span className="selection-item-title">{name}</span>}
          description={<span className="selection-item-subheading">{description}</span>}
        />
      </List.Item>
      {(postalAddress || accessibility) && (
        <Row gutter={[28, 0]} align="top">
          {postalAddress && (
            <Col flex="190px">
              <Row>
                <Col>
                  <span className="selection-item-sub-title">
                    {t('dashboard.events.addEditEvent.location.streetAddress')}
                  </span>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="selection-item-sub-content">
                    <address>
                      {postalAddress?.streetAddress && (
                        <span>
                          {contentLanguageBilingual({
                            en: postalAddress?.streetAddress?.en,
                            fr: postalAddress?.streetAddress?.fr,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            calendarContentLanguage: calendarContentLanguage,
                          })}
                          ,&nbsp;
                        </span>
                      )}
                      <br />
                      {postalAddress?.addressLocality && (
                        <span>
                          {contentLanguageBilingual({
                            en: postalAddress?.addressLocality?.en,
                            fr: postalAddress?.addressLocality?.fr,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            calendarContentLanguage: calendarContentLanguage,
                          })}
                          ,&nbsp;
                        </span>
                      )}
                      {postalAddress?.addressRegion && (
                        <span>
                          {contentLanguageBilingual({
                            en: postalAddress?.addressRegion?.en,
                            fr: postalAddress?.addressRegion?.fr,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            calendarContentLanguage: calendarContentLanguage,
                          })}
                          &nbsp;
                        </span>
                      )}

                      {postalAddress?.postalCode && <span>{postalAddress?.postalCode}</span>}
                      <br />
                      {openingHours && (
                        <p>
                          <a
                            href={`${openingHours}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="selection-item-sub-content"
                            style={{ color: '#0F0E98' }}>
                            <span className="open-hour-url-link">
                              {t('dashboard.events.addEditEvent.location.openingHours')}
                            </span>
                            &nbsp;
                            <LinkOutlined />
                          </a>
                        </p>
                      )}
                    </address>
                  </div>
                </Col>
              </Row>
            </Col>
          )}
          {accessibility?.length > 0 && (
            <Col flex="190px">
              <Row>
                <Col>
                  <span className="selection-item-sub-title">
                    {t('dashboard.events.addEditEvent.location.venueAccessibility')}
                  </span>
                </Col>
              </Row>
              <Row>
                <Col>
                  {accessibility?.map((venueAccessibiltiy, index) => (
                    <span className="selection-item-sub-content" key={index}>
                      {contentLanguageBilingual({
                        en: venueAccessibiltiy?.name?.en,
                        fr: venueAccessibiltiy?.name?.fr,
                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                        calendarContentLanguage: calendarContentLanguage,
                      })}
                      <br />
                    </span>
                  ))}
                </Col>
              </Row>
            </Col>
          )}
        </Row>
      )}
      {artsDataLink && (
        <div className="arts-data-link">
          <div className="arts-data-link-content">
            <span
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => window.open(`${artsDataLink}`, '_blank', 'noopener,noreferrer')}>
              Artsdata
            </span>
            {name && <span>{name}</span>}
            {description && <Badge color="#1B3DE6" />}
            {description && <span>{description}</span>}
          </div>
          <LinkOutlined />
        </div>
      )}
    </div>
  );
}

export default SelectionItem;
