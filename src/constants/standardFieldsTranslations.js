import { Translation } from 'react-i18next';

export const PLACE = [
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.place.PlaceAccessibility')}</Translation>,
    key: 'PlaceAccessibility',
    value: 'PlaceAccessibility',
    en: 'Place accessibility',
    fr: 'Accessibilité du lieu',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.place.Region')}</Translation>,
    key: 'Region',
    value: 'Region',
    en: 'District',
    fr: 'Quartier',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.place.Type')}</Translation>,
    key: 'Type',
    value: 'Type',
    en: 'Place type',
    fr: 'Type de lieux',
  },
];

export const EVENT = [
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.Event.EventAccessibility')}</Translation>,
    key: 'EventAccessibility',
    value: 'EventAccessibility',
    en: 'Event accessibility',
    fr: "Accessibilité de l'événement",
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.Event.Audience')}</Translation>,
    key: 'Audience',
    value: 'Audience',
    en: 'Audience',
    fr: 'Public',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.Event.EventType')}</Translation>,
    key: 'EventType',
    value: 'EventType',
    en: 'Event type',
    fr: "Type d'événement",
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.Event.EventDiscipline')}</Translation>,
    key: 'EventDiscipline',
    value: 'EventDiscipline',
    en: 'Discipline',
    fr: 'Discipline',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.place.inLanguage')}</Translation>,
    key: 'inLanguage',
    value: 'inLanguage',
    en: 'Language of event',
    fr: "Langue de l'événement",
  },
];

export const PERSON = [
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.Person.Occupation')}</Translation>,
    key: 'Occupation',
    value: 'Occupation',
    en: 'Occupation',
    fr: 'Occupation',
  },
];

export const ORGANIZATION = [
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.organization.organizationType')}</Translation>,
    key: 'OrganizationType',
    value: 'OrganizationType',
    en: 'Organization type',
    fr: "Type d'organisme",
  },
];
