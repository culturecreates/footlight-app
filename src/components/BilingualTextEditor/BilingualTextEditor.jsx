import React, { useRef, useState } from 'react';
import { contentLanguage } from '../../constants/contentLanguage';
import { useTranslation } from 'react-i18next';
import ContentLanguageInput from '../ContentLanguageInput';
import BilingualInput from '../BilingualInput';
import TextEditor from '../TextEditor';

function BilingualTextEditor(props) {
  const { name, data, placeholder, calendarContentLanguage, required } = props;
  const { t } = useTranslation();
  const reactQuillRefFr = useRef(null);
  const reactQuillRefEn = useRef(null);
  const [descriptionMinimumWordCount] = useState(props?.descriptionMinimumWordCount ?? null);

  return (
    <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
      <BilingualInput fieldData={data}>
        <TextEditor
          formName={name?.concat(['fr'])}
          key={contentLanguage.FRENCH}
          calendarContentLanguage={calendarContentLanguage}
          initialValue={data?.fr}
          dependencies={name?.concat(['en'])}
          editorLanguage={'fr'}
          placeholder={placeholder?.fr}
          currentReactQuillRef={reactQuillRefFr}
          descriptionMinimumWordCount={descriptionMinimumWordCount}
          rules={[
            required
              ? () => ({
                  validator() {
                    if (
                      reactQuillRefFr?.current?.unprivilegedEditor?.getLength() > 1 ||
                      reactQuillRefEn?.current?.unprivilegedEditor?.getLength() > 1
                    ) {
                      return Promise.resolve();
                    } else
                      return Promise.reject(
                        new Error(
                          calendarContentLanguage === contentLanguage.ENGLISH ||
                          calendarContentLanguage === contentLanguage.FRENCH
                            ? t('dashboard.organization.createNew.validations.unilingualEmptyDescription')
                            : calendarContentLanguage === contentLanguage.BILINGUAL &&
                              t('dashboard.organization.createNew.validations.emptyDescription', {
                                wordCount: descriptionMinimumWordCount,
                              }),
                        ),
                      );
                  },
                })
              : [],
            descriptionMinimumWordCount
              ? () => ({
                  validator() {
                    if (
                      reactQuillRefFr?.current?.unprivilegedEditor
                        ?.getText()
                        .split(' ')
                        ?.filter((n) => n != '')?.length > descriptionMinimumWordCount
                    ) {
                      return Promise.resolve();
                    } else if (
                      reactQuillRefEn?.current?.unprivilegedEditor
                        ?.getText()
                        .split(' ')
                        ?.filter((n) => n != '')?.length > descriptionMinimumWordCount
                    )
                      return Promise.resolve();
                    else
                      return Promise.reject(
                        new Error(
                          calendarContentLanguage === contentLanguage.ENGLISH ||
                          calendarContentLanguage === contentLanguage.FRENCH
                            ? t('dashboard.organization.createNew.validations.unilingualDescriptionShort')
                            : calendarContentLanguage === contentLanguage.BILINGUAL &&
                              t('dashboard.organization.createNew.validations.frenchShort'),
                        ),
                      );
                  },
                })
              : [],
          ]}
        />

        <TextEditor
          formName={name?.concat(['en'])}
          key={contentLanguage.ENGLISH}
          initialValue={data?.en}
          calendarContentLanguage={calendarContentLanguage}
          dependencies={name?.concat(['fr'])}
          editorLanguage={'en'}
          placeholder={placeholder?.en}
          descriptionMinimumWordCount={descriptionMinimumWordCount}
          currentReactQuillRef={reactQuillRefEn}
          rules={[
            required
              ? () => ({
                  validator() {
                    if (
                      reactQuillRefFr?.current?.unprivilegedEditor?.getLength() > 1 ||
                      reactQuillRefEn?.current?.unprivilegedEditor?.getLength() > 1
                    ) {
                      return Promise.resolve();
                    } else
                      return Promise.reject(
                        new Error(
                          calendarContentLanguage === contentLanguage.ENGLISH ||
                          calendarContentLanguage === contentLanguage.FRENCH
                            ? t('dashboard.organization.createNew.validations.unilingualEmptyDescription')
                            : calendarContentLanguage === contentLanguage.BILINGUAL &&
                              t('dashboard.organization.createNew.validations.emptyDescription', {
                                wordCount: descriptionMinimumWordCount,
                              }),
                        ),
                      );
                  },
                })
              : [],

            descriptionMinimumWordCount
              ? () => ({
                  validator() {
                    if (
                      reactQuillRefEn?.current?.unprivilegedEditor
                        ?.getText()
                        .split(' ')
                        ?.filter((n) => n != '')?.length > descriptionMinimumWordCount
                    ) {
                      return Promise.resolve();
                    } else if (
                      reactQuillRefFr?.current?.unprivilegedEditor
                        ?.getText()
                        .split(' ')
                        ?.filter((n) => n != '')?.length > descriptionMinimumWordCount
                    )
                      return Promise.resolve();
                    else
                      return Promise.reject(
                        new Error(
                          calendarContentLanguage === contentLanguage.ENGLISH ||
                          calendarContentLanguage === contentLanguage.FRENCH
                            ? t('dashboard.organization.createNew.validations.unilingualDescriptionShort')
                            : calendarContentLanguage === contentLanguage.BILINGUAL &&
                              t('dashboard.organization.createNew.validations.englishShort'),
                        ),
                      );
                  },
                })
              : [],
          ]}
        />
      </BilingualInput>
    </ContentLanguageInput>
  );
}

export default BilingualTextEditor;
