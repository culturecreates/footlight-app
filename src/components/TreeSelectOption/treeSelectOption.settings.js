import { contentLanguageBilingual } from '../../utils/bilingual';
import SelectionItem from '../List/SelectionItem';
import Icon, { UserOutlined } from '@ant-design/icons';
import { ReactComponent as Organizations } from '../../assets/icons/organisations.svg';
import { taxonomyClass } from '../../constants/taxonomyClass';
import { sourceOptions } from '../../constants/sourceOptions';
import { languageFallbackStatusCreator } from '../../utils/languageFallbackStatusCreator';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import { isDataValid } from '../../utils/MultiLingualFormItemSupportFunctions';

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
  let isFieldsDirty = {};
  calendarContentLanguage.forEach((language) => {
    const langKey = contentLanguageKeyMap[language];
    isFieldsDirty[langKey] = false;
  });
  let options = data?.map((entity) => {
    let mainImageData = entity?.image;
    const entityTypes = Array.isArray(entity?.type) ? entity.type : [entity?.type?.toUpperCase()];

    const isOrganization = entityTypes.includes(taxonomyClass.ORGANIZATION);
    const isPerson = entityTypes.includes(taxonomyClass.PERSON);

    return {
      label: (
        <SelectionItem
          itemWidth="100%"
          icon={
            isOrganization ? (
              entity?.logo?.thumbnail?.uri || mainImageData?.original?.uri ? (
                <img src={entity?.logo?.thumbnail?.uri ?? mainImageData?.original?.uri} />
              ) : (
                <Icon component={Organizations} style={{ color: '#607EFC' }} />
              )
            ) : isPerson ? (
              entity?.image?.thumbnail?.uri ? (
                <img src={entity?.image?.thumbnail?.uri} />
              ) : (
                <UserOutlined style={{ color: '#607EFC' }} />
              )
            ) : null
          }
          name={
            isDataValid(entity?.name)
              ? contentLanguageBilingual({
                  data: entity?.name,
                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  calendarContentLanguage: calendarContentLanguage,
                })
              : typeof entity?.name === 'string' && entity?.name
          }
          description={
            isDataValid(entity?.disambiguatingDescription)
              ? contentLanguageBilingual({
                  data: entity?.disambiguatingDescription,
                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  calendarContentLanguage: calendarContentLanguage,
                })
              : typeof entity?.description === 'string' && entity?.description
          }
          calendarContentLanguage={calendarContentLanguage}
          artsDataLink={entity?.uri}
          showExternalSourceLink={true}
        />
      ),
      value: entity?.id,
      type: entity?.type,
      name: isDataValid(entity?.name)
        ? contentLanguageBilingual({
            data: entity?.name,
            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
            calendarContentLanguage,
          })
        : typeof entity?.name === 'string' && entity?.name,
      description: isDataValid(entity?.disambiguatingDescription)
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
        ? languageFallbackStatusCreator({
            calendarContentLanguage,
            fieldData: entity?.name,
            languageFallbacks: currentCalendarData?.languageFallbacks,
            isFieldsDirty,
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

export const findMatchingItems = (array2 = [], searchTerms = []) => {
  const results = [];

  for (const item of array2) {
    const titleMatch = searchTerms?.includes(item?.title?.toLowerCase());
    if (titleMatch) {
      results.push(item);
    }

    if (item?.children) {
      const childMatches = item.children.filter((child) => searchTerms?.includes(child?.title?.toLowerCase()));
      results.push(...childMatches);
    }
  }

  return results;
};
