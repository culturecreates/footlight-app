import { Col, Form, Row } from 'antd';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createSearchParams, useLocation, useSearchParams } from 'react-router-dom';
import BreadCrumbButton from '../../../components/Button/BreadCrumb/BreadCrumbButton';
import PrimaryButton from '../../../components/Button/Primary';
import './addTaxonomy.css';

const AddTaxonomy = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const taxonomyId = searchParams.get('id');
  const { t } = useTranslation();
  useEffect(() => {
    if (location.state?.data) {
      setSearchParams(createSearchParams({ id: location.state.data.id }));
    }
  }, []);

  const saveTaxonomyHandler = (e) => {
    console.log('clicked save', e);
  };

  return (
    <Form>
      <Row className="add-taxonomy-wrapper">
        <Col span={24}>
          <Row justify="space-between">
            <Col>
              <BreadCrumbButton />
              <div className="add-Taxonomy-heading">
                <h4>{taxonomyId ? t('dashboard.taxonomy.addNew.heading') : t('dashboard.taxonomy.addNew.heading')}</h4>
              </div>
            </Col>
            <Col>
              <div className="add-event-button-wrap">
                <Form.Item>
                  <PrimaryButton
                    label={t('dashboard.taxonomy.addNew.save')}
                    onClick={(e) => saveTaxonomyHandler(e)}
                    // disabled={updateEventLoading || addEventLoading || addImageLoading ? true : false}
                  />
                </Form.Item>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Form>
  );
};

export default AddTaxonomy;
