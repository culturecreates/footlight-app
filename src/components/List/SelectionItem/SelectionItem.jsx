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
import { contentLanguageKeyMap } from '../../../constants/contentLanguage';
import { isDataValid } from '../../../utils/MultiLingualFormItemSupportFunctions.js';
import { taxonomyClass } from '../../../constants/taxonomyClass.js';
import { PathName } from '../../../constants/pathName.js';
import { useNavigate, useParams } from 'react-router-dom';
import Link from 'antd/lib/typography/Link.js';
import { truncateText } from '../../../utils/stringManipulations.js';
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
    calendarContentLanguage = [],
    artsDataLink,
    artsDataDetails,
    showExternalSourceLink,
    onEdit,
    edit,
    creatorId,
    fallbackConfig,
    onClickHandle = { navigationFlag: false },
  } = props;
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);
  const navigate = useNavigate();
  const { calendarId } = useParams();
  let literalKey = '?';

  const promptFlag = calendarContentLanguage.some((language) => {
    const langKey = contentLanguageKeyMap[language];
    return fallbackConfig?.[langKey]?.fallbackLiteralKey === '?';
  });

  const fallbackFlag = calendarContentLanguage.some((language) => {
    const langKey = contentLanguageKeyMap[language];
    const config = fallbackConfig?.[langKey];
    if (config?.tagDisplayStatus) {
      literalKey = config.fallbackLiteralKey;
      return true;
    }
    return false;
  });

  const promptText = promptFlag
    ? t('common.forms.languageLiterals.unKnownLanguagePromptText')
    : t('common.forms.languageLiterals.knownLanguagePromptText');

  const routinghandler = (e) => {
    const type = onClickHandle?.entityType;
    const id = onClickHandle?.entityId;
    e.stopPropagation();

    if (type?.toUpperCase() == taxonomyClass.ORGANIZATION)
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}/${id}`);
    else if (type?.toUpperCase() == taxonomyClass.PERSON)
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}/${id}`);
    else if (type?.toUpperCase() == taxonomyClass.PLACE)
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}/${id}`);
    else if (type?.toUpperCase() == taxonomyClass.EVENT)
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}/${id}`);
  };

  return (
    <div
      className="selection-item-wrapper"
      onClick={onClickHandle?.navigationFlag ? routinghandler : null}
      style={{
        border: bordered ? '1px solid #607EFC' : undefined,
        width: itemWidth || undefined,
        cursor: onClickHandle?.navigationFlag ? 'pointer' : undefined,
      }}>
      <List.Item
        className="selection-item-list-wrapper"
        data-cy="list-item"
        actions={[
          showExternalSourceLink && artsDataLink && (
            <ArtsDataLink data-cy="artsdata-link-tag">
              <Link href={artsDataLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', gap: '7px', color: '#0f0e98' }}>
                  <span style={{ textDecoration: 'underline' }}>Artsdata</span>
                  <LinkOutlined style={{ display: 'grid', placeContent: 'center', color: '#0f0e98' }} />
                </div>
              </Link>
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
              {truncateText(name, 127)}
              {fallbackFlag && <LiteralBadge tagTitle={literalKey} promptText={promptText} />}
            </span>
          }
          description={
            <span className="selection-item-subheading" data-cy="span-entity-description">
              {truncateText(description, 70)}
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
                      {isDataValid(postalAddress?.streetAddres) && (
                        <span data-cy="span-street-address">
                          {contentLanguageBilingual({
                            data: postalAddress?.streetAddress,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            calendarContentLanguage: calendarContentLanguage,
                          })}
                          ,&nbsp;
                        </span>
                      )}
                      {isDataValid(postalAddress?.streetAddres) && <br />}
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
