import { bilingual } from '../../utils/bilingual';
import SelectionItem from '../List/SelectionItem';
import Icon, { UserOutlined } from '@ant-design/icons';
import { ReactComponent as Organizations } from '../../assets/icons/organisations.svg';
import { taxonomyClass } from '../../constants/taxonomyClass';

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

export const treeEntitiesOption = (data, user) => {
  let options = data?.map((entity) => {
    return {
      label: (
        <SelectionItem
          icon={
            entity?.type?.toUpperCase() == taxonomyClass.ORGANIZATION ? (
              <Icon component={Organizations} style={{ color: '#607EFC' }} />
            ) : (
              entity?.type?.toUpperCase() == taxonomyClass.PERSON && <UserOutlined style={{ color: '#607EFC' }} />
            )
          }
          name={bilingual({
            en: entity?.name?.en,
            fr: entity?.name?.fr,
            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          })}
          description={bilingual({
            en: entity?.disambiguatingDescription?.en,
            fr: entity?.disambiguatingDescription?.fr,
            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
          })}
        />
      ),
      value: entity?.id,
      type: entity?.type,
    };
  });
  return options;
};
