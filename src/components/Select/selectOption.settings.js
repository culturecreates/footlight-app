import { bilingual } from '../../utils/bilingual';

export const taxonomyOptions = (data, user, mappedToField) => {
  let fieldData = data?.data?.filter((taxonomy) => taxonomy?.mappedToField === mappedToField);
  let concepts = fieldData?.map((field) => {
    return field?.concept;
  });

  let options = concepts[0]?.map((concept) => {
    return {
      label: bilingual({
        en: concept?.name?.en,
        fr: concept?.name?.fr,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
      }),
      value: concept?.id,
    };
  });
  return options;
};
