import { Form } from 'antd';
import React, { useState, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import './textEditor.css';
import 'react-quill/dist/quill.snow.css';
import { useTranslation } from 'react-i18next';
import { pluralize } from '../../utils/pluralise';
import OutlinedButton from '../Button/Outlined';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import { useAddImageMutation } from '../../services/image';
import { useParams } from 'react-router-dom';
import Quill from 'quill';
const Delta = Quill.import('delta');

import i18next from 'i18next';
function TextEditor(props) {
  const {
    formName,
    initialValue,
    dependencies,
    rules,
    currentReactQuillRef,
    placeholder,
    editorLanguage,
    descriptionMinimumWordCount,
    calendarContentLanguage,
  } = props;
  let translateTo;

  const currentInterfaceLanguage = i18next.language;
  const languageKeys = Object.keys(contentLanguageKeyMap);
  languageKeys.map((key) => {
    if (editorLanguage != contentLanguageKeyMap[key]) return;

    if (editorLanguage != currentInterfaceLanguage) translateTo = currentInterfaceLanguage;
    else
      translateTo =
        contentLanguageKeyMap[
          calendarContentLanguage.find((language) => contentLanguageKeyMap[language] != editorLanguage)
        ];
  });
  const { calendarId } = useParams();
  const [addImage] = useAddImageMutation();

  const { t } = useTranslation();
  const [wordCount, setWordCount] = useState(
    currentReactQuillRef?.current?.unprivilegedEditor
      ?.getText()
      .split(' ')
      ?.filter((n) => n != '').length,
  );
  var formats = [
    'background',
    'bold',
    'color',
    'font',
    'code',
    'italic',
    'link',
    'size',
    'strike',
    'script',
    'underline',
    'blockquote',
    'header',
    'indent',
    'list',
    'align',
    'direction',
    'code-block',
    'formula',
  ];

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await addImage({ data: formData, calendarId }).unwrap();
      if (response) return response.data?.original?.url?.uri;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const removeImagesMatcher = (node, delta) => {
    if (node.nodeName === 'IMG') {
      return new Delta();
    }
    return delta;
  };

  const imageHandler = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const range = currentReactQuillRef.current.getEditor().getSelection();
      const imageUrl = await uploadImage(file);

      if (imageUrl) {
        currentReactQuillRef.current.getEditor().insertEmbed(range.index, 'image', imageUrl);
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: '1' }],
          ['bold', 'italic', 'underline'],
          [{ align: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ color: [] }, { background: [] }],
          ['link'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
        matchers: [[Node.ELEMENT_NODE, removeImagesMatcher]],
      },
    }),
    [],
  );

  const onChange = () => {
    const filteredCount = currentReactQuillRef?.current?.unprivilegedEditor
      ?.getText()
      ?.split(' ')
      ?.filter((n) => n != '');
    filteredCount &&
      setWordCount(
        filteredCount[filteredCount.length - 1] === '\n' && filteredCount?.length == 1
          ? filteredCount?.length - 1
          : filteredCount?.length,
      );
  };

  const translateHandler = () => {
    let newString = currentReactQuillRef?.current?.unprivilegedEditor?.getText();
    //Note: Replace "/" with "\/"// //Note: Replace "/" with "\/"
    newString = newString?.replace(/\//g, '\\/');
    // //Note: Replace "|" with "\|"
    newString = newString?.replace(/\|/g, '\\|');
    newString = encodeURIComponent(newString);
    window.open(`${process.env.REACT_APP_DEEPL_URL}${editorLanguage}/${translateTo}/${newString}`);
  };

  const onDropHandler = (e) => {
    const items = e.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
      if ((items[i].kind === 'file' && items[i].type.startsWith('image/')) || items[i].type.startsWith('video/')) {
        e.preventDefault();
        return;
      }
    }
  };

  useEffect(() => {
    const filteredCount = currentReactQuillRef?.current?.unprivilegedEditor
      ?.getText()
      ?.split(' ')
      ?.filter((n) => n != '');
    filteredCount &&
      setWordCount(
        filteredCount[filteredCount.length - 1] === '\n' && filteredCount?.length == 1
          ? filteredCount?.length - 1
          : filteredCount?.length,
      );
  }, [
    currentReactQuillRef?.current?.unprivilegedEditor
      ?.getText()
      ?.split(' ')
      .filter((n) => n != '')?.length,
  ]);

  return (
    <div onDrop={onDropHandler} data-cy={`editor-description-${editorLanguage}`}>
      <Form.Item name={formName} initialValue={initialValue} dependencies={dependencies} rules={rules}>
        <ReactQuill
          ref={currentReactQuillRef}
          placeholder={placeholder}
          className="text-editor"
          modules={modules}
          formats={formats}
          style={{
            border: `${calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
          }}
          preserveWhitespace
          onChange={onChange}
          data-cy="text-editor"
        />
      </Form.Item>
      <div className="event-description-footer">
        {descriptionMinimumWordCount > 1 ? (
          <p data-cy="para-description-footer-title">
            {t('dashboard.events.addEditEvent.otherInformation.description.footerTitle', {
              wordCount: descriptionMinimumWordCount,
            })}
          </p>
        ) : (
          <div></div>
        )}
        <p data-cy="description-word-count">
          {pluralize(wordCount, t('dashboard.events.addEditEvent.otherInformation.description.word'))}
        </p>
      </div>
      {calendarContentLanguage.length > 1 && (
        <OutlinedButton
          label={t('dashboard.events.addEditEvent.otherInformation.description.translate')}
          size="middle"
          disabled={wordCount > 1 ? false : true}
          onClick={translateHandler}
          data-cy="button-translate"
        />
      )}
    </div>
  );
}
export default TextEditor;
