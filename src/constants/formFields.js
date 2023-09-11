import { Form, Input } from 'antd';
import TextEditor from '../components/TextEditor';
import NoContent from '../components/NoContent/NoContent';
import { CloseCircleOutlined } from '@ant-design/icons';
import Tags from '../components/Tags/Common/Tags';
import TreeSelectOption from '../components/TreeSelectOption/TreeSelectOption';
import { treeTaxonomyOptions } from '../components/TreeSelectOption/treeSelectOption.settings';
import { contentLanguage } from './contentLanguage';
import ContentLanguageInput from '../components/ContentLanguageInput/ContentLanguageInput';
import BilingualInput from '../components/BilingualInput/BilingualInput';
import ImageUpload from '../components/ImageUpload/ImageUpload';
import { contentLanguageBilingual } from '../utils/bilingual';
import { Translation } from 'react-i18next';
import StyledInput from '../components/Input/Common';

const { TextArea } = Input;

export const formCategory = {
  PRIMARY: 'Primary',
};

export const formTypes = {
  INPUT: 'Input',
  MULTISELECT: 'MultiSelect',
  TEXTAREA: 'TextArea',
  EDITOR: 'Editor',
  IMAGE: 'Image',
};

export const dataTypes = {
  MULTI_LINGUAL: 'MultiLingual',
  STANDARD_FIELD: 'StandardField',
  STRING: 'String',
  IDENTITY_STRING: 'IdentityString',
  URI_STRING: 'URIString',
  IMAGE: 'Image',
};

const rules = [
  {
    dataType: dataTypes.URI_STRING,
    rule: {
      type: 'url',
      message: <Translation>{(t) => t('dashboard.events.addEditEvent.validations.url')}</Translation>,
    },
  },
];

export const formFieldValue = [
  {
    type: formTypes.INPUT,
    element: ({ datatype, data, calendarContentLanguage, name = [], placeholder, user, t, validations }) => {
      if (datatype === dataTypes.MULTI_LINGUAL)
        return (
          <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
            <BilingualInput fieldData={data}>
              <Form.Item
                name={name?.concat(['fr'])}
                key={contentLanguage.FRENCH}
                dependencies={name?.concat(['en'])}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value || getFieldValue([name?.concat(['en'])])) {
                        return Promise.resolve();
                      } else return Promise.reject(new Error(validations?.fr));
                    },
                  }),
                ]}>
                <TextArea
                  autoSize
                  autoComplete="off"
                  placeholder={placeholder?.fr}
                  style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name={name?.concat(['en'])}
                key={contentLanguage.ENGLISH}
                dependencies={name?.concat(['fr'])}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value || getFieldValue([name?.concat(['fr'])])) {
                        return Promise.resolve();
                      } else return Promise.reject(new Error(validations?.en));
                    },
                  }),
                ]}>
                <TextArea
                  autoSize
                  autoComplete="off"
                  placeholder={placeholder?.en}
                  style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                  size="large"
                />
              </Form.Item>
            </BilingualInput>
          </ContentLanguageInput>
        );
      else if (datatype === dataTypes.URI_STRING)
        return (
          <StyledInput
            addonBefore="https://"
            autoComplete="off"
            style={{ width: '423px' }}
            placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderWebsite')}
          />
        );
      else
        return (
          <TextArea
            autoSize
            autoComplete="off"
            placeholder={contentLanguageBilingual({
              en: placeholder?.en,
              fr: placeholder?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            })}
            style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
            size="large"
          />
        );
    },
  },
  {
    type: formTypes.TEXTAREA,
    element: ({ placeholder, user, calendarContentLanguage }) => (
      <TextArea
        autoSize
        autoComplete="off"
        placeholder={contentLanguageBilingual({
          en: placeholder?.en,
          fr: placeholder?.fr,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          calendarContentLanguage: calendarContentLanguage,
        })}
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
    element: ({ taxonomyData, user, type, isDynamicField, calendarContentLanguage, placeholder }) => {
      return (
        <TreeSelectOption
          allowClear
          treeDefaultExpandAll
          notFoundContent={<NoContent />}
          placeholder={contentLanguageBilingual({
            en: placeholder?.en,
            fr: placeholder?.fr,
            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
            calendarContentLanguage: calendarContentLanguage,
          })}
          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
          treeData={treeTaxonomyOptions(taxonomyData, user, type, isDynamicField, calendarContentLanguage)}
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
  {
    type: formTypes.IMAGE,
    element: ({
      form,
      largeUrl,
      originalUrl,
      imageReadOnly,
      preview,
      eventImageData,
      name,
      datatype,
      position,
      userTips,
    }) => (
      <>
        {position === 'top' && datatype === dataTypes.IMAGE && <p className="add-event-date-heading">{userTips}</p>}
        <ImageUpload
          imageUrl={largeUrl}
          originalImageUrl={originalUrl}
          imageReadOnly={imageReadOnly}
          preview={preview}
          form={form}
          eventImageData={eventImageData}
          isCrop={false}
          formName={name}
        />
      </>
    ),
  },
];

export const renderFormFields = ({
  // type,
  datatype,
  element,
  initialValue = undefined,
  name,
  key,
  required,
  userTips,
  position,
  hidden,
  label,
}) => {
  return (
    <>
      {position === 'top' && datatype !== dataTypes.IMAGE && <p className="add-event-date-heading">{userTips}</p>}

      <Form.Item
        label={label}
        name={name}
        key={key}
        initialValue={initialValue}
        required={required}
        hidden={hidden}
        rules={rules?.map((rule) => {
          if (datatype === rule?.dataType) return rule.rule;
        })}
        help={position === 'bottom' && userTips ? <p className="add-event-date-heading">{userTips}</p> : undefined}>
        {element}
      </Form.Item>
    </>
  );
};
