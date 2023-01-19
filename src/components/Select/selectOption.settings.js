import { bilingual } from '../../utils/bilingual';
import SelectionItem from '../List/SelectionItem';

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

export const placesOptions = (data, user) => {
  let options = data?.map((place) => {
    return {
      label: (
        <SelectionItem
          icon="A"
          name={bilingual({
            en: place?.name?.en,
            fr: place?.name?.fr,
            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          })}
          description={bilingual({
            en: place?.disambiguatingDescription?.en,
            fr: place?.disambiguatingDescription?.fr,
            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          })}
        />
      ),
      value: place?.id,
    };
  });
  return options;
};
