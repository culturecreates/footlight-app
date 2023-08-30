import { Form, Input } from 'antd';
import TextEditor from '../components/TextEditor';
import NoContent from '../components/NoContent/NoContent';
import { CloseCircleOutlined } from '@ant-design/icons';
import Tags from '../components/Tags/Common/Tags';
import TreeSelectOption from '../components/TreeSelectOption/TreeSelectOption';
import { treeTaxonomyOptions } from '../components/TreeSelectOption/treeSelectOption.settings';

const { TextArea } = Input;

export const formTypes = {
  INPUT: 'Input',
  MULTISELECT: 'MultiSelect',
  TEXTAREA: 'TextArea',
  EDITOR: 'Editor',
};

export const dataTypes = {
  MULTI_LINGUAL: 'MultiLingual',
  STANDARD_FIELD: 'StandardField',
  STRING: 'String',
  IDENTITY_STRING: 'IdentityString',
  URI_STRING: 'URIString',
};

export const formFieldValue = [
  {
    type: formTypes.INPUT,
    element: () => (
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
    element: () => (
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
    element: () => <TextEditor />,
  },
  {
    type: formTypes.MULTISELECT,
    element: (data, user, type, isDynamicField, calendarContentLanguage) => {
      return (
        <TreeSelectOption
          allowClear
          treeDefaultExpandAll
          notFoundContent={<NoContent />}
          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
          treeData={treeTaxonomyOptions(data, user, type, isDynamicField, calendarContentLanguage)}
          tagRender={(props) => {
            const { label, closable, onClose } = props;
            return (
              <Tags
                closable={closable}
                onClose={onClose}
                closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                {label}
              </Tags>
            );
          }}
        />
      );
    },
  },
];

export const renderFormFields = ({
  // type,
  // dataType,
  element,
  rules = [],
  initialValue = undefined,
  name,
  key,
  required,
  ...rest
}) => {
  return (
    <Form.Item name={name} key={key} initialValue={initialValue} rules={rules} required={required} {...rest}>
      {element}
    </Form.Item>
  );
};
