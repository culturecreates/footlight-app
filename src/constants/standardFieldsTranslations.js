import { Translation } from 'react-i18next';

export const PLACE = [
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.place.PlaceAccessibility')}</Translation>,
    key: 'PlaceAccessibility',
    en: 'Place accessibility',
    fr: 'Accessibilité du lieu',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.place.Region')}</Translation>,
    key: 'Region',
    en: 'District',
    fr: 'Quartier',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.place.Type')}</Translation>,
    key: 'Type',
    en: 'Place type',
    fr: 'Type de lieux',
  },
];

export const EVENT = [
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.place.inLanguage')}</Translation>,
    key: 'inLanguage',
    en: 'Language of event',
    fr: "Langue de l'événement",
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.Event.EventAccessibility')}</Translation>,
    key: 'EventAccessibility',
    en: 'Event accessibility',
    fr: "Accessibilité de l'événement",
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.Event.Audience')}</Translation>,
    key: 'Audience',
    en: 'Audience',
    fr: 'Public',
  },
  {
    label: <Translation>{(t) => t('dashboard.taxonomy.standardFields.Event.EventType')}</Translation>,
    key: 'EventType',
    en: 'Event type',
    fr: "Type d'événement",
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
