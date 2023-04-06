import { bilingual } from '../../utils/bilingual';
import SelectionItem from '../List/SelectionItem';
import Icon, { UserOutlined } from '@ant-design/icons';
import { ReactComponent as Organizations } from '../../assets/icons/organisations.svg';
import { taxonomyClass } from '../../constants/taxonomyClass';

const handleMultilevelTreeSelect = (children, user) => {
  return children?.map((child) => {
    return {
      title: bilingual({
        en: child?.name?.en,
        fr: child?.name?.fr,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
      }),
      value: child?.id,
      ...(child?.children && {
        children: handleMultilevelTreeSelect(child?.children),
      }),
    };
  });
};
export const treeTaxonomyOptions = (data, user, mappedToField, isDynamicField) => {
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
        title: bilingual({
          en: concept?.name?.en,
          fr: concept?.name?.fr,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        }),
        value: concept?.id,
        ...(concept?.children && {
          children: handleMultilevelTreeSelect(concept?.children, user),
        }),
      };
    });
  return options;
};

export const treeEntitiesOption = (data, user) => {
  let options = data?.map((entity) => {
    return {
      label: (
        <SelectionItem
          itemWidth="100%"
          icon={
            entity?.type?.toUpperCase() == taxonomyClass.ORGANIZATION ? (
              <Icon component={Organizations} style={{ color: '#607EFC' }} />
            ) : (
              entity?.type?.toUpperCase() == taxonomyClass.PERSON && <UserOutlined style={{ color: '#607EFC' }} />
            )
          }
          name={
            (entity?.name || entity?.name?.en || entity?.name?.fr) &&
            bilingual({
              en: entity?.name?.en,
              fr: entity?.name?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
            })
          }
          description={
            (entity?.disambiguatingDescription ||
              entity?.disambiguatingDescription?.en ||
              entity?.disambiguatingDescription?.en) &&
            bilingual({
              en: entity?.disambiguatingDescription?.en,
              fr: entity?.disambiguatingDescription?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
            })
          }
        />
      ),
      value: entity?.id,
      type: entity?.type,
      name:
        (entity?.name || entity?.name?.en || entity?.name?.fr) &&
        bilingual({
          en: entity?.name?.en,
          fr: entity?.name?.fr,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        }),
      description:
        (entity?.disambiguatingDescription ||
          entity?.disambiguatingDescription?.en ||
          entity?.disambiguatingDescription?.en) &&
        bilingual({
          en: entity?.disambiguatingDescription?.en,
          fr: entity?.disambiguatingDescription?.fr,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        }),
    };
  });
  return options;
};

export const treeDynamicTaxonomyOptions = (concepts, user) => {
  let options =
    concepts &&
    concepts?.map((concept) => {
      return {
        title: bilingual({
          en: concept?.name?.en,
          fr: concept?.name?.fr,
          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        }),
        value: concept?.id,
        ...(concept?.children && {
          children: handleMultilevelTreeSelect(concept?.children, user),
        }),
      };
    });
  return options;
};
