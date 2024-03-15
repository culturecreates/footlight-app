import React, { useState } from 'react';
import { Card, Col, Divider, Row } from 'antd';
import { bilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';

function MandatoryField(props) {
  const { field } = props;
  const { user } = useSelector(getUserDetails);

  const [addedFields, setAddedFields] = useState(field?.filter((f) => f?.isRequiredField));
  const [availableFields, setAvailableFields] = useState(field?.filter((f) => !f?.isRequiredField));

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
    <Card>
      <Row gutter={[0, 18]}>
        <Col span={24}>
          <h5>General Settings</h5>
        </Col>
        <Col span={11}>
          <h5>General Settings</h5>
          <ul>
            {addedFields.map((field, index) => (
              <li key={index}>
                {bilingual({
                  en: field?.label?.en,
                  fr: field?.label?.fr,
                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                })}
                {!field?.preFilled && <button onClick={() => removeFromFields(index)}>Remove</button>}
              </li>
            ))}
          </ul>
        </Col>
        <Col>
          <Divider type="vertical" style={{ height: '100%' }} />
        </Col>
        <Col span={11}>
          <h5>General Settings</h5>
          <ul>
            {availableFields.map((field, index) => (
              <li key={index} onClick={() => addToFields(field)}>
                {bilingual({
                  en: field?.label?.en,
                  fr: field?.label?.fr,
                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                })}
              </li>
            ))}
          </ul>
        </Col>
      </Row>
    </Card>
  );
}

export default MandatoryField;
