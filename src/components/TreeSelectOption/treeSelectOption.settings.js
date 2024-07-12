import { contentLanguageBilingual } from '../../utils/bilingual';
import SelectionItem from '../List/SelectionItem';
import Icon, { UserOutlined } from '@ant-design/icons';
import { ReactComponent as Organizations } from '../../assets/icons/organisations.svg';
import { taxonomyClass } from '../../constants/taxonomyClass';
import { sourceOptions } from '../../constants/sourceOptions';
import { languageFallbackSetup } from '../../utils/languageFallbackSetup';

const handleMultilevelTreeSelect = (children, user, calendarContentLanguage, parentLabel) => {
  return children?.map((child) => {
    return {
      title: contentLanguageBilingual({
        data: child?.name,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        calendarContentLanguage: calendarContentLanguage,
      }),
      value: child?.id,
      ...(child?.children && {
        children: handleMultilevelTreeSelect(child?.children, user, calendarContentLanguage, parentLabel),
      }),
      label:
        parentLabel +
        '-' +
        contentLanguageBilingual({
          data: child?.name,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          calendarContentLanguage: calendarContentLanguage,
        }),
      key: child?.id,
    };
  });
};
export const treeTaxonomyOptions = (data, user, mappedToField, isDynamicField, calendarContentLanguage) => {
  let fieldData = data?.data?.filter((taxonomy) => {
    if (taxonomy?.isDynamicField) {
      if (taxonomy?.isDynamicField == isDynamicField && taxonomy?.mappedToField === mappedToField) return true;
    } else if (taxonomy?.mappedToField === mappedToField) return true;
  });
  let concepts = fieldData?.map((field) => {
    return field?.concept;
  });

  let options =
    concepts &&
    concepts[0]?.map((concept) => {
      return {
        title: contentLanguageBilingual({
          data: concept?.name,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          calendarContentLanguage: calendarContentLanguage,
        }),
        value: concept?.id,
        ...(concept?.children && {
          children: handleMultilevelTreeSelect(
            concept?.children,
            user,
            calendarContentLanguage,
            contentLanguageBilingual({
              data: concept?.name,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            }),
          ),
        }),
        label: contentLanguageBilingual({
          data: concept?.name,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          calendarContentLanguage: calendarContentLanguage,
        }),
        key: concept?.id,
      };
    });
  return options;
};

export const treeEntitiesOption = (
  data,
  user,
  calendarContentLanguage,
  source = sourceOptions.CMS,
  currentCalendarData,
) => {
  let options = data?.map((entity) => {
    return {
      label: (
        <SelectionItem
          itemWidth="100%"
          icon={
            entity?.type?.toUpperCase() == taxonomyClass.ORGANIZATION ? (
              entity?.logo?.thumbnail?.uri ? (
                <img src={entity?.logo?.thumbnail?.uri} />
              ) : (
                <Icon component={Organizations} style={{ color: '#607EFC' }} />
              )
            ) : (
              entity?.type?.toUpperCase() == taxonomyClass.PERSON &&
              (entity?.image?.thumbnail?.uri ? (
                <img src={entity?.image?.thumbnail?.uri} />
              ) : (
                <UserOutlined style={{ color: '#607EFC' }} />
              ))
            )
          }
          name={
            entity?.name?.en || entity?.name?.fr
              ? contentLanguageBilingual({
                  data: entity?.name,
                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  calendarContentLanguage: calendarContentLanguage,
                })
              : typeof entity?.name === 'string' && entity?.name
          }
          description={
            entity?.disambiguatingDescription?.en || entity?.disambiguatingDescription?.fr
              ? contentLanguageBilingual({
                  data: entity?.disambiguatingDescription,
                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  calendarContentLanguage: calendarContentLanguage,
                })
              : typeof entity?.description === 'string' && entity?.description
          }
          artsDataLink={entity?.uri}
          showExternalSourceLink={true}
        />
      ),
      value: entity?.id,
      type: entity?.type,
      name:
        entity?.name?.en || entity?.name?.fr
          ? contentLanguageBilingual({
              en: entity?.name?.en,
              fr: entity?.name?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            })
          : typeof entity?.name === 'string' && entity?.name,
      description:
        entity?.disambiguatingDescription?.en || entity?.disambiguatingDescription?.fr
          ? contentLanguageBilingual({
              data: entity?.disambiguatingDescription,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            })
          : typeof entity?.description === 'string' && entity?.description,
      contact: entity?.contactPoint,
      uri: entity?.uri,
      source: source,
      creatorId: entity?.creator?.userId,
      fallBackStatus: currentCalendarData
        ? languageFallbackSetup({
            currentCalendarData,
            fieldData: entity?.name,
            languageFallbacks: currentCalendarData?.languageFallbacks,
            isFieldsDirty: true,
          })
        : null,
    };
  });
  return options;
};

export const treeDynamicTaxonomyOptions = (concepts, user, calendarContentLanguage) => {
  let options =
    concepts &&
    concepts?.map((concept) => {
      return {
        title: contentLanguageBilingual({
          data: concept?.name,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          calendarContentLanguage: calendarContentLanguage,
        }),
        value: concept?.id,
        ...(concept?.children && {
          children: handleMultilevelTreeSelect(
            concept?.children,
            user,
            calendarContentLanguage,
            contentLanguageBilingual({
              data: concept?.name,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            }),
          ),
        }),
        label: contentLanguageBilingual({
          data: concept?.name,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          calendarContentLanguage: calendarContentLanguage,
        }),
      };
    });
  return options;
};
