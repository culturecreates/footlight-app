import React, { useEffect, useState } from 'react';
import './mandatoryField.css';
import { Card, Col, Divider, Row } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { bilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import AddField from '../../Button/AddField';
import { useTranslation } from 'react-i18next';

function MandatoryField(props) {
  const { field, formName, formLabel, setDirtyStatus, tabKey } = props;
  let { updatedFormFields } = props;
  const { user } = useSelector(getUserDetails);
  const { t } = useTranslation();

  const [addedFields, setAddedFields] = useState();
  const [availableFields, setAvailableFields] = useState();

  const removeFromFields = (index) => {
    let removedField = addedFields[index];
    removedField = {
      ...removedField,
      isRequiredField: false,
    };
    if (!removedField?.preFilled) {
      let updatedFields = addedFields.filter((field, i) => i !== index);
      updatedFormFields = updatedFormFields?.map((f) => {
        if (f.formName === formName) {
          f.formFields = updatedFields?.concat([...availableFields, removedField]);
        }
        return f;
      });

      setAddedFields(updatedFields);
      setAvailableFields([...availableFields, removedField]);
      setDirtyStatus(true);
    }
  };

  const addToFields = (field) => {
    let updatedFields = availableFields.filter((f) => f?.mappedField !== field?.mappedField);
    updatedFields = updatedFields?.map((f) => {
      return {
        ...f,
        isRequiredField: false,
      };
    });
    updatedFormFields = updatedFormFields?.map((f) => {
      if (f.formName === formName) {
        f.formFields = updatedFields?.concat([...addedFields, { ...field, isRequiredField: true }]);
      }
      return f;
    });
    setAddedFields([...addedFields, { ...field, isRequiredField: true }]);
    setAvailableFields(updatedFields);
    setDirtyStatus(true);
  };

  useEffect(() => {
    if (tabKey != '4') return;

    setAddedFields(field?.filter((f) => f?.isRequiredField || f?.preFilled));
    setAvailableFields(field?.filter((f) => !f?.isRequiredField && !f?.preFilled && !f?.isAdminOnlyField));
  }, [tabKey]);

  return (
    <Card className="mandatory-card-wrapper" bodyStyle={{ padding: '24px 16px 24px 16px' }}>
      <Row gutter={[0, 18]}>
        <Col span={24}>
          <h5 className="mandatory-field-class-heading">{formLabel}</h5>
        </Col>
        <Col span={11}>
          <h5 className="mandatory-field-required">{t('dashboard.settings.mandatoryFields.title')}</h5>
          {addedFields?.map((field, index) => (
            <Row key={index}>
              <Col span={24}>
                <AddField
                  key={index}
                  label={bilingual({
                    data: field?.label,
                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  })}
                  disabled={field?.preFilled}
                  onClick={() => removeFromFields(index)}
                  icon={<MinusOutlined />}
                />
              </Col>
            </Row>
          ))}
        </Col>
        <Col>
          <Divider type="vertical" style={{ height: '100%', border: '1px solid #B6C1C9' }} />
        </Col>
        <Col span={11} push={1}>
          <h5 className="mandatory-field-available">{t('dashboard.settings.mandatoryFields.availableFields')}</h5>
          {availableFields?.map((field, index) => (
            <Row key={index}>
              <Col span={24}>
                <AddField
                  key={index}
                  label={bilingual({
                    data: field?.label,
                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  })}
                  onClick={() => addToFields(field)}
                  icon={<PlusOutlined />}
                />
              </Col>
            </Row>
          ))}
        </Col>
      </Row>
    </Card>
  );
}

export default MandatoryField;
