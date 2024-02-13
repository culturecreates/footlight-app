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
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.place.inLanguage')}</Translation>,
    key: 'inLanguage',
    value: 'inLanguage',
    en: 'Language of event',
    fr: "Langue de l'événement",
  },
  // {
  //   label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.Event.PerformerRole')}</Translation>,
  //   key: 'PerformerRole',
  //   en: 'Organizer Role',
  //   fr: "Rôle de l'organisation",
  // },
  // {
  //   label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.Event.OrganizerRole')}</Translation>,
  //   key: 'OrganizerRole',
  //   en: 'Performer Role',
  //   fr: "Rôle d'interprète",
  // },
  // {
  //   label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.Event.SupporterRole')}</Translation>,
  //   key: 'SupporterRole',
  //   en: 'Contributor Role',
  //   fr: 'Rôle de contributeur',
  // },
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

//   'EventAccessibility',
//   'Audience',
//   'EventType',
//   'OrganizerRole',
//   'PerformerRole',
//   'SupporterRole',
//   'inLanguage',

// 'Type'

// 'Occupation'
