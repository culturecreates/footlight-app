import { contentLanguageBilingual } from '../../utils/bilingual';
import SelectionItem from '../List/SelectionItem';
import Icon, { UserOutlined } from '@ant-design/icons';
import { ReactComponent as Organizations } from '../../assets/icons/organisations.svg';
import { taxonomyClass } from '../../constants/taxonomyClass';

const handleMultilevelTreeSelect = (children, user, calendarContentLanguage) => {
  return children?.map((child) => {
    return {
      title: contentLanguageBilingual({
        en: child?.name?.en,
        fr: child?.name?.fr,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        calendarContentLanguage: calendarContentLanguage,
      }),
      value: child?.id,
      ...(child?.children && {
        children: handleMultilevelTreeSelect(child?.children, user, calendarContentLanguage),
      }),
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
          en: concept?.name?.en,
          fr: concept?.name?.fr,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          calendarContentLanguage: calendarContentLanguage,
        }),
        value: concept?.id,
        ...(concept?.children && {
          children: handleMultilevelTreeSelect(concept?.children, user, calendarContentLanguage),
        }),
      };
    });
  return options;
};

export const treeEntitiesOption = (data, user, calendarContentLanguage) => {
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
            (entity?.name || entity?.name?.en || entity?.name?.fr) &&
            contentLanguageBilingual({
              en: entity?.name?.en,
              fr: entity?.name?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            })
          }
          description={
            (entity?.disambiguatingDescription ||
              entity?.disambiguatingDescription?.en ||
              entity?.disambiguatingDescription?.en) &&
            contentLanguageBilingual({
              en: entity?.disambiguatingDescription?.en,
              fr: entity?.disambiguatingDescription?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            })
          }
        />
      ),
      value: entity?.id,
      type: entity?.type,
      name:
        (entity?.name || entity?.name?.en || entity?.name?.fr) &&
        contentLanguageBilingual({
          en: entity?.name?.en,
          fr: entity?.name?.fr,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          calendarContentLanguage: calendarContentLanguage,
        }),
      description:
        (entity?.disambiguatingDescription ||
          entity?.disambiguatingDescription?.en ||
          entity?.disambiguatingDescription?.en) &&
        contentLanguageBilingual({
          en: entity?.disambiguatingDescription?.en,
          fr: entity?.disambiguatingDescription?.fr,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          calendarContentLanguage: calendarContentLanguage,
        }),
      contact: entity?.contactPoint,
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
          en: concept?.name?.en,
          fr: concept?.name?.fr,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          calendarContentLanguage: calendarContentLanguage,
        }),
        value: concept?.id,
        ...(concept?.children && {
          children: handleMultilevelTreeSelect(concept?.children, user),
        }),
      };
    });
  return options;
};
