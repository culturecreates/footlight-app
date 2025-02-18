import LiteralBadge from '../Badge/LiteralBadge';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'antd';

/**
 * @param {Object} props - Props for the EditableCell component.
 * @param {string} props.title - Title of the column.
 * @param {boolean} props.editable - Whether the cell is editable.
 * @param {React.ReactNode} props.children - Child elements inside the cell.
 * @param {string} props.dataIndex - Data index for the cell value.
 * @param {Object} props.record - Record object for the current row.
 * @param {function} props.handleSave - Function to save the edited cell value.
 * @param {Object} [props.fallbackStatus] - Object containing fallback status details.
 * @param {Object} [props.restProps] - Additional props passed to the cell.
 */

const { TextArea } = Input;

const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, fallbackStatus, ...restProps }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState();
  const inputRef = useRef(null);
  const { t } = useTranslation();

  const toggleEdit = () => {
    setEditing(!editing);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  };

  const save = () => {
    handleSave({ ...record, [dataIndex]: value });
    setEditing(false);
  };

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    if (!record) return;
    if (!record[dataIndex]) return;

    setValue(record[dataIndex]);
  }, [dataIndex, record]);

  let isFallbackPresent = false;
  let fallbackPromptText = '';
  const recordKey = contentLanguageKeyMap[title?.toUpperCase()];

  if (fallbackStatus && recordKey && fallbackStatus[recordKey]) {
    isFallbackPresent = fallbackStatus[recordKey]?.tagDisplayStatus;
    fallbackPromptText =
      fallbackStatus[recordKey]?.fallbackLiteralKey == '?'
        ? t('common.forms.languageLiterals.unKnownLanguagePromptText')
        : t('common.forms.languageLiterals.knownLanguagePromptText');
  }

  const fallbackComponent = isFallbackPresent ? (
    <LiteralBadge tagTitle={fallbackStatus[recordKey]?.fallbackLiteralKey} promptText={fallbackPromptText} />
  ) : (
    <></>
  );

  if (!editable) {
    return (
      <td {...restProps}>
        {children}
        {fallbackComponent}
      </td>
    );
  }

  return (
    <td {...restProps} data-cy={'taxonomy-concept-cell-' + dataIndex}>
      {editing ? (
        <TextArea
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onBlur={save}
          onPressEnter={save}
          autoSize
          autoComplete="off"
          style={{
            borderRadius: '4px',
            border: '1px solid #B6C1C9',
          }}
          size="large"
        />
      ) : (
        <div
          onClick={toggleEdit}
          style={{
            minHeight: '20px',
            minWidth: '50px',
          }}>
          {children}
        </div>
      )}
      {fallbackComponent}
    </td>
  );
};

export default EditableCell;
