import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import { sourceOptions } from '../../constants/sourceOptions';
import { contentLanguageBilingual } from '../../utils/bilingual';
import { languageFallbackStatusCreator } from '../../utils/languageFallbackStatusCreator';
import { isDataValid } from '../../utils/MultiLingualFormItemSupportFunctions';
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
        data: concept?.name,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        calendarContentLanguage: calendarContentLanguage,
      }),
      value: concept?.id,
    };
  });
  return options;
};

export const placesOptions = (
  data,
  user,
  calendarContentLanguage,
  source = sourceOptions.CMS,
  currentCalendarData,
  enableDynamicBorder,
) => {
  let isFieldsDirty = {};
  calendarContentLanguage.forEach((language) => {
    const langKey = contentLanguageKeyMap[language];
    isFieldsDirty[langKey] = false;
  });

  let options = data?.map((place) => {
    const isValidated = place?.validationReport?.hasAllMandatoryFields;
    return {
      label: (
        <SelectionItem
          itemWidth="100%"
          icon={<EnvironmentOutlined style={{ color: '#607EFC' }} />}
          {...(enableDynamicBorder && {
            borderColor: isValidated ? undefined : 'red',
          })}
          bordered={enableDynamicBorder ? !isValidated : false}
          region={place?.regions}
          name={
            isDataValid(place?.name)
              ? contentLanguageBilingual({
                  data: place?.name,
                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  calendarContentLanguage: calendarContentLanguage,
                })
              : typeof place?.name === 'string' && place?.name
          }
          description={
            isDataValid(place?.disambiguatingDescription)
              ? contentLanguageBilingual({
                  data: place?.disambiguatingDescription,
                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  calendarContentLanguage: calendarContentLanguage,
                })
              : typeof place?.description === 'string' && place?.description
          }
          calendarContentLanguage={calendarContentLanguage}
          artsDataLink={place?.uri}
          showExternalSourceLink={true}
        />
      ),
      value: place?.id,
      name: isDataValid(place?.name)
        ? contentLanguageBilingual({
            data: place?.name,
            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
            calendarContentLanguage: calendarContentLanguage,
          })
        : typeof place?.name === 'string' && place?.name,
      description: isDataValid(place?.disambiguatingDescription)
        ? contentLanguageBilingual({
            data: place?.disambiguatingDescription,
            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
            calendarContentLanguage: calendarContentLanguage,
          })
        : typeof place?.description === 'string' && place?.description,
      postalAddress: place?.postalAddress ?? place?.address,
      region: place?.regions,
      accessibility: place?.accessibility ?? [],
      openingHours: place?.openingHours,
      key: place?.id,
      sameAs: place?.sameAs,
      source: source,
      uri: place?.uri,
      validationReport: place?.validationReport,
      type: place?.type,
      creatorId: place?.creator?.userId ?? place?.createdByUserId,
      fallBackStatus: currentCalendarData
        ? languageFallbackStatusCreator({
            calendarContentLanguage,
            fieldData: place?.name,
            languageFallbacks: currentCalendarData?.languageFallbacks,
            isFieldsDirty,
          })
        : null,
    };
  });
  return options;
};

export const filterPlaceOption = (inputValue, option) => {
  if (option?.label?.props?.name?.toLowerCase()?.includes(inputValue?.toLowerCase())) return true;
  else return false;
};
