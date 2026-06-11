const hasEntityId = (value) => {
  if (!value || typeof value !== 'object') return false;

  return Boolean(value.entityId || value.id || value._id || value.key);
};

export const isReadOnlyValueEmpty = (value) => {
  if (value === null || value === undefined) return true;

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return true;

    return value.every((item) => isReadOnlyValueEmpty(item));
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return true;

    // For linked entity objects, treat missing entity id as empty.
    if (
      (Object.prototype.hasOwnProperty.call(value, 'entityId') ||
        Object.prototype.hasOwnProperty.call(value, 'id') ||
        Object.prototype.hasOwnProperty.call(value, '_id') ||
        Object.prototype.hasOwnProperty.call(value, 'key')) &&
      !hasEntityId(value)
    ) {
      return true;
    }

    return keys.every((key) => isReadOnlyValueEmpty(value[key]));
  }

  return false;
};

export const shouldDisplayReadOnlyField = ({
  fieldKey,
  value,
  mandatoryFieldKeys = [],
  adminOnly = false,
  canViewAdminOnly = true,
}) => {
  if (adminOnly && !canViewAdminOnly) {
    return false;
  }

  if (!isReadOnlyValueEmpty(value)) {
    return true;
  }

  return mandatoryFieldKeys.includes(fieldKey);
};

export const shouldShowMandatoryMissingMessage = ({ fieldKey, value, mandatoryFieldKeys = [] }) => {
  return mandatoryFieldKeys.includes(fieldKey) && isReadOnlyValueEmpty(value);
};

const getMandatoryFieldKeysByType = ({ type, mandatoryStandardFields, mandatoryDynamicFields }) =>
  type === 'standard' ? mandatoryStandardFields : mandatoryDynamicFields;

export const createReadOnlyFieldRenderers = ({
  mandatoryStandardFields = [],
  mandatoryDynamicFields = [],
  canViewAdminOnly = true,
  t,
}) => {
  const checkIfFieldIsToBeDisplayed = (field, data, type = 'standard', adminOnly = false) => {
    const mandatoryFieldKeys = getMandatoryFieldKeysByType({
      type,
      mandatoryStandardFields,
      mandatoryDynamicFields,
    });

    return shouldDisplayReadOnlyField({
      fieldKey: field,
      value: data,
      mandatoryFieldKeys,
      adminOnly,
      canViewAdminOnly,
    });
  };

  const renderMissingValueMessage = (fieldKey, fieldLabel, value, dataCy, type = 'standard') => {
    const mandatoryFieldKeys = getMandatoryFieldKeysByType({
      type,
      mandatoryStandardFields,
      mandatoryDynamicFields,
    });

    if (!shouldShowMandatoryMissingMessage({ fieldKey, value, mandatoryFieldKeys })) {
      return null;
    }

    return (
      <p className="no-content-text" data-cy={dataCy}>
        {t('common.readOnly.emptyValue', {
          fieldName: fieldLabel,
        })}
      </p>
    );
  };

  return {
    checkIfFieldIsToBeDisplayed,
    renderMissingValueMessage,
  };
};
