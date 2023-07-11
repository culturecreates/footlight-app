import React, { useEffect, useRef } from 'react';
import './organizationsReadOnly.css';
import Card from '../../../components/Card/Common/Event';
import { useTranslation } from 'react-i18next';
import { Breadcrumb, Col, Row } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useGetOrganizationQuery } from '../../../services/organization';
import { PathName } from '../../../constants/pathName';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';

function OrganizationsReadOnly() {
  const { t } = useTranslation();
  const { organizationId, calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const navigate = useNavigate();
  const [currentCalendarData] = useOutletContext();

  const {
    data: organizationData,
    isLoading: organizationLoading,
    isSuccess: organizationSuccess,
    isError: organizationError,
  } = useGetOrganizationQuery(
    { id: organizationId, calendarId, sessionId: timestampRef },
    { skip: organizationId ? false : true },
  );

  const { user } = useSelector(getUserDetails);

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  useEffect(() => {
    if (organizationError) navigate(`${PathName.NotFound}`);
  }, [organizationError]);

  console.log(organizationData);

  return (
    organizationSuccess &&
    !organizationLoading && (
      <Row gutter={[32, 24]} className="read-only-wrapper">
        <Col span={24}>
          <Breadcrumb className="breadcrumb-item">
            <Breadcrumb.Item>
              <LeftOutlined style={{ marginRight: '17px' }} />
              {t('dashboard.sidebar.events')}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Col>

        <Col span={24}>
          <Row>
            <Col>
              <div className="read-only-event-heading">
                <h4>haiii</h4>
                <p className="read-only-event-content-sub-title-secondary">
                  {contentLanguageBilingual({
                    en: organizationData?.disambiguatingDescription?.en,
                    fr: organizationData?.disambiguatingDescription?.fr,
                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                    calendarContentLanguage: calendarContentLanguage,
                  })}
                </p>
              </div>
            </Col>
          </Row>
        </Col>
        <Card>
          <>
            <p className="read-only-event-content-sub-title-primary">
              {t('dashboard.events.addEditEvent.language.title')}
            </p>
            <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
            <p className="read-only-event-content">{organizationData?.name?.fr}</p>
            <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
            <p className="read-only-event-content">{organizationData?.name?.en}</p>

            <p className="read-only-event-content-sub-title-primary">
              {t('dashboard.events.addEditEvent.language.title')}
            </p>
            <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
            <p className="read-only-event-content">{organizationData?.disambiguatingDescription?.fr}</p>
            <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
            <p className="read-only-event-content">{organizationData?.disambiguatingDescription?.en}</p>

            <p className="read-only-event-content-sub-title-primary">
              {t('dashboard.events.addEditEvent.language.title')}
            </p>
            <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
            <p className="read-only-event-content">
              <div dangerouslySetInnerHTML={{ __html: organizationData?.description?.fr }} />
            </p>
            <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
            <p className="read-only-event-content">
              <div dangerouslySetInnerHTML={{ __html: organizationData?.description?.en }} />
            </p>

            <p className="read-only-event-content-sub-title-primary">
              {t('dashboard.events.addEditEvent.language.title')}
            </p>
            <p>
              <a href={organizationData?.url?.uri} target="_blank" rel="noopener noreferrer" className="url-links">
                {organizationData?.url?.uri}
              </a>
            </p>

            <p className="read-only-event-content-sub-title-primary">
              {t('dashboard.events.addEditEvent.language.title')}
            </p>
            <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
            <p className="read-only-event-content">{organizationData?.contactPoint?.name?.fr}</p>
            <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
            <p className="read-only-event-content">{organizationData?.contactPoint?.name?.en}</p>
            <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
            <p>
              <a
                href={organizationData?.contactPoint?.url?.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="url-links">
                {organizationData?.contactPoint?.url?.uri}
              </a>
            </p>
            <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
            <p className="url-links">{organizationData?.contactPoint?.telephone}</p>
            <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
            <p className="url-links">{organizationData?.contactPoint?.email}</p>
          </>
          <></>
        </Card>
      </Row>
    )
  );
}

export default OrganizationsReadOnly;
