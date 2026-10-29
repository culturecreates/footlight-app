import { useEffect, useRef } from 'react';

export const useValidateOnOpen = ({
  shouldValidateOnOpen,
  isRoutingBack,
  debouncedLoading,
  getValidateFieldList,
  form,
  handleValidationError,
}) => {
  const hasValidatedOnOpenRef = useRef(false);

  useEffect(() => {
    if (!shouldValidateOnOpen || !isRoutingBack || hasValidatedOnOpenRef.current || debouncedLoading) {
      return;
    }

    const validateFieldList = getValidateFieldList();
    if (!validateFieldList?.length) return;

    const timer = setTimeout(() => {
      if (hasValidatedOnOpenRef.current) return;
      hasValidatedOnOpenRef.current = true;
      form.validateFields(validateFieldList).catch((error) => handleValidationError(error));
    }, 180);

    return () => clearTimeout(timer);
  }, [shouldValidateOnOpen, isRoutingBack, debouncedLoading, getValidateFieldList, form, handleValidationError]);
};
