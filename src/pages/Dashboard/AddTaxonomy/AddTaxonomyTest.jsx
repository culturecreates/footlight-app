import React, { useEffect, useRef, useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { getStandardFieldArrayForClass, standardFieldsForTaxonomy } from '../../../utils/standardFields';
import { useLocation, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { taxonomyClassTranslations } from '../../../constants/taxonomyClass';
import { Col, Form, Row } from 'antd';
import BreadCrumbButton from '../../../components/Button/BreadCrumb/BreadCrumbButton';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../../components/Button/Primary';
import './addTaxonomy.css';
import { useLazyGetTaxonomyQuery } from '../../../services/taxonomy';
import Select from '../../../components/Select';

const taxonomyClasses = taxonomyClassTranslations.map((item) => {
  return { ...item, value: item.key };
});

const AddTaxonomyTest = () => {
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    getCalendar,
    setContentBackgroundColor,
  ] = useOutletContext();
  let [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId } = useParams();
  const location = useLocation();

  const taxonomyId = searchParams.get('id');
  setContentBackgroundColor('#F9FAFF');

  const [loading, setLoading] = useState(false);
  const [standardFields, setStandardFields] = useState([]);

  const [getTaxonomy, { data: taxonomyData }] = useLazyGetTaxonomyQuery({
    sessionId: timestampRef,
  });
  //   const [addTaxonomy] = useAddTaxonomyMutation();
  //   const [updateTaxonomy] = useUpdateTaxonomyMutation();

  useEffect(() => {
    if (taxonomyId && currentCalendarData) {
      setLoading(true);
      getTaxonomy({ id: taxonomyId, includeConcepts: true, calendarId })
        .unwrap()
        .then((res) => {
          const availableStandardFields = standardFieldsForTaxonomy(
            res?.taxonomyClass,
            currentCalendarData?.fieldTaxonomyMaps,
          );
          setStandardFields([
            ...availableStandardFields,
            getStandardFieldArrayForClass(res?.taxonomyClass).find((i) => i.key == res?.mappedToField),
          ]);

          setLoading(false);
        });
    }
  }, [taxonomyId, currentCalendarData]);

  useEffect(() => {
    // setup for new taxonomy
    if (!taxonomyId && currentCalendarData) {
      setLoading(true);
      if (location.state?.selectedClass) {
        const selectedKeys = taxonomyClassTranslations.filter((item) => item.key === location.state?.selectedClass);
        console.log(selectedKeys);
        const availableStandardFields = standardFieldsForTaxonomy(
          location.state?.selectedClass,
          currentCalendarData?.fieldTaxonomyMaps,
        );
        setStandardFields(availableStandardFields);
      }
      setLoading(false);
    }
    if (location.state?.id) {
      setSearchParams(location.state?.id);
    }
  }, [currentCalendarData]);

  const saveTaxonomyHandler = (e) => {
    e.preventDefault();
    return 0;
  };

  //   const classSelectionRoutine = (selectedKeys) => {
  //     if (selectedKeys) {
  //       const classItem = taxonomyClassTranslations.find((item) => {
  //         return item.key === selectedKeys[0];
  //       });

  //       const availableStandardFields = standardFieldsForTaxonomy(
  //         selectedKeys[0],
  //         currentCalendarData?.fieldTaxonomyMaps,
  //       );
  //       setStandardFields([
  //         ...availableStandardFields,
  //         getStandardFieldArrayForClass(classItem?.key).find((i) => i.key == form.getFieldValue('mappedToField')),
  //       ]);
  //       return taxonomyClassTranslations[0];
  //     } else return { ...taxonomyClassTranslations[0], value: taxonomyClassTranslations[0].key };
  //   };

  useEffect(() => {
    console.log(standardFields, taxonomyData);
  }, []);

  return (
    <>
      {!loading ? (
        <Form layout="vertical" form={form}>
          <Row className="add-taxonomy-wrapper">
            <Col span={24}>
              <Row justify="space-between">
                <Col>
                  <BreadCrumbButton />
                  <div className="add-Taxonomy-heading">
                    <h4 data-cy="heading-add-edit-taxonomy">
                      {taxonomyId ? t('dashboard.taxonomy.addNew.editHeading') : t('dashboard.taxonomy.addNew.heading')}
                    </h4>
                  </div>
                </Col>
                <Col>
                  <div className="add-event-button-wrap">
                    <Form.Item>
                      <PrimaryButton
                        data-cy="button-taxonomy-save"
                        label={t('dashboard.taxonomy.addNew.save')}
                        onClick={(e) => saveTaxonomyHandler(e)}
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col flex="423px">
              <Form.Item
                data-cy="form-item-taxonomy-class"
                label={t('dashboard.taxonomy.addNew.class')}
                initialValue={
                  taxonomyId
                    ? taxonomyData?.className
                    : location.state?.selectedClass
                    ? location.state?.selectedClass
                    : taxonomyClasses[0]
                }
                name="class"
                required
                className={`classType ${taxonomyId != '' ? 'disabled-dropdown' : ''}`}>
                <Select data-cy="dropdown-taxonomy-class" options={taxonomyClasses} disabled={!!taxonomyId} />
              </Form.Item>
              <span className="field-description" data-cy="span-taxonomy-class-helper-text">
                {t(`dashboard.taxonomy.addNew.destinationHeading`)}
              </span>
            </Col>
            {(location.state?.dynamic === 'dynamic' || (taxonomyId && !taxonomyData?.isDynamicField)) && (
              <Col>
                {/* <Form.Item
                  label={t('dashboard.taxonomy.addNew.mapToField')}
                  required
                  className="classType"
                  name="mappedToField"
                  data-cy="form-item-taxonomy-mapped-field-title">
                  <Select
                    data-cy="dropdown-taxonomy-mapped-field"
                    options={standardFields.filter((s) => s != undefined)}
                    menu={{
                      selectable: true,
                      onSelect: ({ selectedKeys }) => {
                        const item = getStandardFieldArrayForClass(form.getFieldValue('class')).find(
                          (i) => i.key == selectedKeys[0],
                        );
                        const name = {
                          en: item?.en,
                          fr: item?.fr,
                        };
                        form.setFieldValue('frenchname', item?.fr);
                        form.setFieldValue('englishname', item?.en);
                        setFormValues({
                          ...formValues,
                          mapToField: selectedKeys[0],
                          name,
                        });
                        setRender(!render);
                      },
                    }}
                    disabled={formValues?.classType === '' || standardFields.filter((s) => s != undefined).length === 0}
                    trigger={['click']}
                  />
                </Form.Item> */}
              </Col>
            )}
          </Row>
        </Form>
      ) : (
        <div style={{ display: 'grid', placeContent: 'center', height: '500px', width: '100%' }}>
          <LoadingIndicator />
        </div>
      )}
    </>
  );
};

export default AddTaxonomyTest;
