import { sourceOptions } from '../../constants/sourceOptions';
import { contentLanguageBilingual } from '../../utils/bilingual';
import SelectionItem from '../List/SelectionItem';
import { EnvironmentOutlined } from '@ant-design/icons';

export const taxonomyOptions = (data, user, mappedToField, calendarContentLanguage) => {
  let fieldData = data?.data?.filter((taxonomy) => taxonomy?.mappedToField === mappedToField);
  let concepts = fieldData?.map((field) => {
    return field?.concept;
  });

  let options = concepts[0]?.map((concept) => {
    return {
      label: contentLanguageBilingual({
        en: concept?.name?.en,
        fr: concept?.name?.fr,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        calendarContentLanguage: calendarContentLanguage,
      }),
      value: concept?.id,
    };
  });
  return options;
};

export const placesOptions = (data, user, calendarContentLanguage, source = sourceOptions.CMS) => {
  let options = data?.map((place) => {
    return {
      label: (
        <SelectionItem
          itemWidth="100%"
          icon={<EnvironmentOutlined style={{ color: '#607EFC' }} />}
          name={
            place?.name?.en || place?.name?.fr
              ? contentLanguageBilingual({
                  en: place?.name?.en,
                  fr: place?.name?.fr,
                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  calendarContentLanguage: calendarContentLanguage,
                })
              : typeof place?.name === 'string' && place?.name
          }
          description={
            place?.disambiguatingDescription?.en || place?.disambiguatingDescription?.fr
              ? contentLanguageBilingual({
                  en: place?.disambiguatingDescription?.en,
                  fr: place?.disambiguatingDescription?.fr,
                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  calendarContentLanguage: calendarContentLanguage,
                })
              : typeof place?.description === 'string' && place?.description
          }
          artsDataLink={place?.uri}
          showExternalSourceLink={true}
        />
      ),
      value: place?.id,
      name:
        place?.name?.en || place?.name?.fr
          ? contentLanguageBilingual({
              en: place?.name?.en,
              fr: place?.name?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            })
          : typeof place?.name === 'string' && place?.name,
      description:
        place?.disambiguatingDescription?.en || place?.disambiguatingDescription?.fr
          ? contentLanguageBilingual({
              en: place?.disambiguatingDescription?.en,
              fr: place?.disambiguatingDescription?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            })
          : typeof place?.description === 'string' && place?.description,
      postalAddress: place?.postalAddress ?? place?.address,
      accessibility: place?.accessibility ?? [],
      openingHours: place?.openingHours,
      key: place?.id,
      sameAs: place?.sameAs,
      source: source,
      uri: place?.uri,
    };
  });
  return options;
};

export const filterPlaceOption = (inputValue, option) => {
  if (option?.label?.props?.name?.toLowerCase()?.includes(inputValue?.toLowerCase())) return true;
  else return false;
};
