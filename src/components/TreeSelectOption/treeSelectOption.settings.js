import { bilingual } from '../../utils/bilingual';

export const treeTaxonomyOptions = (data, user, mappedToField) => {
  let fieldData = data?.data?.filter((taxonomy) => taxonomy?.mappedToField === mappedToField);
  let concepts = fieldData?.map((field) => {
    return field?.concept;
  });

  let options = concepts[0]?.map((concept) => {
    return {
      title: bilingual({
        en: concept?.name?.en,
        fr: concept?.name?.fr,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
      }),
      value: concept?.id,
      ...(concept?.children && {
        children: concept?.children?.map((child) => {
          return {
            title: bilingual({
              en: child?.name?.en,
              fr: child?.name?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
            }),
            value: child?.id,
          };
        }),
      }),
    };
  });
  return options;
};
