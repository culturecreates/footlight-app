import React, { useState } from 'react';
import './mandatoryField.css';
import { Card, Col, Divider, Row } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { bilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import AddField from '../../Button/AddField';

function MandatoryField(props) {
  const { field, formName } = props;
  const { user } = useSelector(getUserDetails);

  const [addedFields, setAddedFields] = useState(field?.filter((f) => f?.isRequiredField || f?.preFilled));
  const [availableFields, setAvailableFields] = useState(field?.filter((f) => !f?.isRequiredField || !f?.preFilled));

  const removeFromFields = (index) => {
    let removedField = addedFields[index];
    removedField = {
      ...removedField,
      isRequiredField: false,
    };
    if (!removedField?.preFilled) {
      const updatedFields = addedFields.filter((field, i) => i !== index);
      setAddedFields(updatedFields);
      setAvailableFields([...availableFields, removedField]);
    }
  };

  const addToFields = (field) => {
    setAddedFields([...addedFields, { ...field, isRequiredField: true }]);
    let updatedFields = availableFields.filter((f) => f?.mappedField !== field?.mappedField);
    updatedFields = updatedFields?.map((f) => {
      return {
        ...f,
        isRequiredField: false,
      };
    });
    setAvailableFields(updatedFields);
  };

  return (
    <Card className="mandatory-card-wrapper" bodyStyle={{ padding: '24px 16px 24px 16px' }}>
      <Row gutter={[0, 18]}>
        <Col span={24}>
          <h5 className="mandatory-field-class-heading">{formName}</h5>
        </Col>
        <Col span={11}>
          <h5 className="mandatory-field-required">General Settings</h5>
          {addedFields.map((field, index) => (
            <Row key={index}>
              <Col span={24}>
                <AddField
                  key={index}
                  label={bilingual({
                    en: field?.label?.en,
                    fr: field?.label?.fr,
                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  })}
                  onClick={() => removeFromFields(index)}
                  icon={<MinusCircleOutlined />}
                />
              </Col>
            </Row>
          ))}
        </Col>
        <Col>
          <Divider type="vertical" style={{ height: '100%', border: '1.5px solid #B6C1C9' }} />
        </Col>
        <Col span={11} push={1}>
          <h5 className="mandatory-field-available">General Settings</h5>
          {availableFields.map((field, index) => (
            <Row key={index}>
              <Col span={24}>
                <AddField
                  key={index}
                  label={bilingual({
                    en: field?.label?.en,
                    fr: field?.label?.fr,
                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  })}
                  onClick={() => addToFields(field)}
                  icon={<PlusCircleOutlined />}
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
