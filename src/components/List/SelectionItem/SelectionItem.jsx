import React from 'react';
import './selectionItem.css';
import { Avatar, List, Button, Row, Col } from 'antd';
import { CloseCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import ArtsDataLink from '../../Tags/ArtsDataLink/ArtsDataLink';
import SmallButton from '../../Button/SmallButton';
import ReadOnlyProtectedComponent from '../../../layout/ReadOnlyProtectedComponent';
import LiteralBadge from '../../Badge/LiteralBadge';

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
    region,
    accessibility,
    openingHours,
    calendarContentLanguage,
    artsDataLink,
    artsDataDetails,
    showExternalSourceLink,
    onEdit,
    edit,
    creatorId,
    fallbackConfig,
  } = props;
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);

  const promptText =
    fallbackConfig?.en?.fallbackLiteralKey === '?' || fallbackConfig?.fr?.fallbackLiteralKey === '?'
      ? t('common.forms.languageLiterals.unKnownLanguagePromptText')
      : t('common.forms.languageLiterals.knownLanguagePromptText');

  return (
    <div
      className="selection-item-wrapper"
      style={{ border: bordered && '1px solid#607EFC', width: itemWidth && itemWidth }}>
      <List.Item
        className="selection-item-list-wrapper"
        data-cy="list-item"
        actions={[
          showExternalSourceLink && artsDataLink && (
            <ArtsDataLink
              onClick={(e) => {
                e.stopPropagation();
                window.open(`${artsDataLink}`, '_blank', 'noopener,noreferrer');
              }}
              data-cy="artsdata-link-tag">
              <span style={{ textDecoration: 'underline' }}>Artsdata</span>
              <LinkOutlined />
            </ArtsDataLink>
          ),
          edit && (
            <ReadOnlyProtectedComponent creator={creatorId}>
              <Button
                type="text"
                key="list-loadmore-close"
                onClick={onEdit}
                style={{ color: '#1b3de6', fontSize: '12px', fontWeight: 600, padding: '0px' }}
                data-cy="button-edit-entity">
                {t('dashboard.organization.readOnly.edit')}
              </Button>
            </ReadOnlyProtectedComponent>
          ),
          closable && (
            <Button
              type="text"
              key="list-loadmore-close"
              onClick={onClose}
              style={{ padding: '0px' }}
              data-cy="button-close-entity">
              <CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '21px' }} />
            </Button>
          ),
        ]}>
        <List.Item.Meta
          avatar={
            <Avatar
              shape="square"
              size={'large'}
              icon={icon}
              style={{
                backgroundColor: '#E3E8FF',
                borderRadius: '4px',
              }}
              data-cy="avatar-entity-logo"
            />
          }
          title={
            <span className="selection-item-title" data-cy="span-entity-name">
              {name}
              {(fallbackConfig?.fr?.tagDisplayStatus || fallbackConfig?.en?.tagDisplayStatus) && (
                <LiteralBadge
                  tagTitle={fallbackConfig?.en?.fallbackLiteralKey ?? fallbackConfig?.fr?.fallbackLiteralKey}
                  promptText={promptText}
                />
              )}
            </span>
          }
          description={
            <span className="selection-item-subheading" data-cy="span-entity-description">
              {description}
            </span>
          }
        />
      </List.Item>
      {(postalAddress || accessibility) && (
        <Row gutter={[28, 0]} align="top">
          {postalAddress && (
            <Col flex="190px">
              <Row>
                <Col>
                  <span className="selection-item-sub-title" data-cy="span-street-address-title">
                    {t('dashboard.events.addEditEvent.location.streetAddress')}
                  </span>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="selection-item-sub-content">
                    <address>
                      {(postalAddress?.streetAddress?.en || postalAddress?.streetAddress?.fr) && (
                        <span data-cy="span-street-address">
                          {contentLanguageBilingual({
                            data: postalAddress?.streetAddress,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            calendarContentLanguage: calendarContentLanguage,
                          })}
                          ,&nbsp;
                        </span>
                      )}
                      {(postalAddress?.streetAddress?.en || postalAddress?.streetAddress?.fr) && <br />}
                      {postalAddress?.addressLocality && (
                        <span data-cy="span-address-locality">
                          {contentLanguageBilingual({
                            data: postalAddress?.addressLocality,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            calendarContentLanguage: calendarContentLanguage,
                          })}
                          ,&nbsp;
                        </span>
                      )}
                      {postalAddress?.addressRegion && (
                        <span data-cy="span-address-region">
                          {contentLanguageBilingual({
                            data: postalAddress?.addressRegion,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            calendarContentLanguage: calendarContentLanguage,
                          })}
                          &nbsp;
                        </span>
                      )}

                      {postalAddress?.postalCode && <span data-cy="span-postal-code">{postalAddress?.postalCode}</span>}
                      <br />
                      {Array.isArray(region) && (
                        <SmallButton
                          styles={{ marginTop: 5, marginBottom: 5 }}
                          label={contentLanguageBilingual({
                            data: region[0]?.name,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            calendarContentLanguage: calendarContentLanguage,
                          })}
                          data-cy="show-region"
                        />
                      )}
                      {openingHours && (
                        <p>
                          <a
                            href={`${openingHours}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="selection-item-sub-content"
                            style={{ color: '#0F0E98' }}
                            data-cy="anchor-opening-hours">
                            <span className="open-hour-url-link" data-cy="span-opening-hours">
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
                  <span className="selection-item-sub-title" data-cy="span-accessibility-title">
                    {t('dashboard.events.addEditEvent.location.venueAccessibility')}
                  </span>
                </Col>
              </Row>
              <Row>
                <Col>
                  {accessibility?.map((venueAccessibiltiy, index) => (
                    <span className="selection-item-sub-content" key={index} data-cy="span-accessibility">
                      {contentLanguageBilingual({
                        data: venueAccessibiltiy?.name,
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
      {artsDataLink && artsDataDetails && (
        <div className="arts-data-link">
          <div className="arts-data-link-content">
            <div className="arts-data-link-first-line">
              <span
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => window.open(`${artsDataLink}`, '_blank', 'noopener,noreferrer')}
                data-cy="span-artsdata-link">
                Artsdata
              </span>
              {name && <span data-cy="span-artsdata-entity-name">{name}</span>}
            </div>
            {description && <span data-cy="span-artsdata-entity-description">{description}</span>}
          </div>

          <LinkOutlined style={{ fontSize: '16px' }} />
        </div>
      )}
    </div>
  );
}

export default SelectionItem;
