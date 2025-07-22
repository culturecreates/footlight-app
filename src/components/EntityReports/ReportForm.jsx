import { Checkbox, Col, Form, Row, Typography } from 'antd';
import React, { useRef } from 'react';
import DatePickerStyled from '../DatePicker';
import { useGetAllTaxonomyQuery } from '../../services/taxonomy';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { bilingual } from '../../utils/bilingual';
import i18next from 'i18next';

const ReportForm = ({ entity, blobUrl, cleanupBlobUrl, setBlobUrl, form }) => {
  const { calendarId } = useParams();
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;

  if (!entity) return null;

  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', entity.toUpperCase());

  const { currentData: taxonomies, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
  });

  // Styles for components
  const dateRangeContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  };

  const formItemStyle = {
    flex: 1,
    marginBottom: 0,
  };

  return (
    <Form
      form={form}
      onValuesChange={() => {
        if (blobUrl) {
          cleanupBlobUrl();
          setBlobUrl(null);
        }
      }}>
      <Row gutter={[4, 4]} style={{ padding: '16px 16px' }}>
        <Col span={24} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Typography.Text strong>{t('common.entityReport.timeFrame')}</Typography.Text>
          <Typography.Text type="danger">*</Typography.Text>
        </Col>
        <Col span={24} style={dateRangeContainerStyle}>
          <Form.Item
            name="startDate"
            style={formItemStyle}
            rules={[
              { required: true, message: t('common.entityReport.validation.dateRange') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const endDate = getFieldValue('endDate');
                  if (!value || !endDate || value.isSameOrBefore(endDate, 'day')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('common.entityReport.validation.startBeforeEnd')));
                },
              }),
            ]}>
            <DatePickerStyled
              disabledDate={(current) => {
                const endDate = form.getFieldValue('endDate');
                return endDate && current && current.isAfter(endDate, 'day');
              }}
            />
          </Form.Item>

          <Typography.Text type="secondary" style={{ alignSelf: 'center' }}>
            {t('common.entityReport.to')}
          </Typography.Text>

          <Form.Item
            name="endDate"
            style={formItemStyle}
            rules={[
              { required: true, message: t('common.entityReport.validation.dateRange') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue('startDate');
                  if (!value || !startDate || value.isSameOrAfter(startDate, 'day')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('common.entityReport.validation.endAfterStart')));
                },
              }),
            ]}>
            <DatePickerStyled
              disabledDate={(current) => {
                const startDate = form.getFieldValue('startDate');
                return startDate && current && current.isBefore(startDate, 'day');
              }}
            />
          </Form.Item>
        </Col>
        {taxonomies?.totalCount > 0 && !taxonomyLoading && (
          <Col span={24} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Typography.Text strong>{t('common.entityReport.moreDetails')}</Typography.Text>
            <Row>
              <Form.Item name="taxonomies">
                <Checkbox.Group style={{ width: '100%' }}>
                  <Row>
                    {taxonomies?.data?.map((taxonomy) => (
                      <Col style={{ minWidth: '100%', marginBottom: '2px' }} key={taxonomy?.id} span={8}>
                        <Checkbox value={taxonomy?.id} style={{ width: '100%' }}>
                          <Typography.Text>
                            {bilingual({ interfaceLanguage: i18next.language, data: taxonomy?.name })}
                          </Typography.Text>
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </Row>
          </Col>
        )}
      </Row>
    </Form>
  );
};

export default ReportForm;
