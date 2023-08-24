import { Form, Input } from 'antd';
import TextEditor from '../components/TextEditor';

const { TextArea } = Input;

const formTypes = {
  INPUT: 'Input',
  MULTISELECT: 'MultiSelect',
  TEXTAREA: 'TextArea',
  EDITOR: 'Editor',
};

export const formFieldValue = [
  {
    type: formTypes.INPUT,
    element: (
      <TextArea
        autoSize
        autoComplete="off"
        // placeholder={t('dashboard.events.addEditEvent.language.placeHolderFrench')}
        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
        size="large"
      />
    ),
  },
  {
    type: formTypes.TEXTAREA,
    element: (
      <TextArea
        autoSize
        autoComplete="off"
        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
        size="large"
      />
    ),
  },
  {
    type: formTypes.EDITOR,
    element: <TextEditor />,
  },
];

export const renderFormFields = ({
  type,
  dataType,
  element,
  rules = [],
  initialValue = undefined,
  name,
  key,
  ...rest
}) => {
  console.log(type, dataType);
  return (
    <Form.Item name={name} key={key} initialValue={initialValue} rules={rules} {...rest}>
      {element}
    </Form.Item>
  );
};
