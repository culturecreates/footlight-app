import { entitiesClass } from '../constants/entitiesClass';
import { contentLanguageBilingual } from './bilingual';

/**
 * Maps a Footlight entity class to the schema type expected by the Artsdata match service.
 */
const RECONCILIATION_TYPE_BY_CLASS = {
  [entitiesClass.organization]: 'schema:Organization',
  [entitiesClass.person]: 'schema:Person',
  [entitiesClass.people]: 'schema:Person',
  [entitiesClass.place]: 'schema:Place',
  [entitiesClass.event]: 'schema:Event',
};

const buildNameCondition = (name) => ({
  matchType: 'name',
  // The Artsdata match service's `name` matcher expects a scalar string. Wrapping the
  // value in an array makes it silently match nothing, which (since the name condition is
  // required) collapses the whole query to zero candidates.
  propertyValue: name,
  required: true,
  matchQuantifier: 'any',
});

const buildPropertyCondition = (propertyId, values) => ({
  matchType: 'property',
  propertyId,
  propertyValue: Array.isArray(values) ? values : [values],
  required: false,
  matchQuantifier: 'any',
});

/**
 * Builds the `{ type, conditions }` payload used by `reconcileArtsDataByQuery` for a given
 * entity. The entity type is inferred from the page (entityClass), so the admin never picks it.
 *
 * Only the name condition is mandatory; identifying properties per class are added when present
 * to improve match precision.
 *
 * @param {Object} params
 * @param {string} params.entityClass - one of `entitiesClass` values.
 * @param {Object} params.entityData - the loaded entity (name, url, address, ...).
 * @param {string[]} params.calendarContentLanguage
 * @param {string} params.interfaceLanguage
 * @returns {{ type: string, conditions: Array }|null} null when no name is available.
 */
export function buildReconciliationQuery({ entityClass, entityData, calendarContentLanguage, interfaceLanguage }) {
  const type = RECONCILIATION_TYPE_BY_CLASS[entityClass];

  const name = contentLanguageBilingual({
    data: entityData?.name,
    interfaceLanguage: interfaceLanguage?.toLowerCase(),
    calendarContentLanguage,
  });

  if (!name) return null;

  const conditions = [buildNameCondition(name)];

  // Class-specific identifying properties (added only when available).
  switch (entityClass) {
    case entitiesClass.organization:
    case entitiesClass.person:
    case entitiesClass.people: {
      const url = entityData?.url?.uri ?? entityData?.url;
      if (url) conditions.push(buildPropertyCondition('schema:url', url));
      break;
    }
    case entitiesClass.place: {
      const street = entityData?.postalAddress?.streetAddress;
      const streetValue = contentLanguageBilingual({
        data: street,
        interfaceLanguage: interfaceLanguage?.toLowerCase(),
        calendarContentLanguage,
      });
      if (streetValue) conditions.push(buildPropertyCondition('schema:streetAddress', streetValue));
      break;
    }
    case entitiesClass.event: {
      if (entityData?.startDateTime || entityData?.startDate) {
        conditions.push(buildPropertyCondition('schema:startDate', entityData?.startDateTime ?? entityData?.startDate));
      }
      break;
    }
    default:
      break;
  }

  return { type, conditions };
}
