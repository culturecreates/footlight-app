import { useEffect, useState } from 'react';

export const useDynamicTaxonomyFields = ({
  taxonomyLoading,
  allTaxonomyData,
  currentCalendarData,
  entityClass,
  buildFieldObject,
}) => {
  const [dynamicFields, setDynamicFields] = useState([]);
  const [addedFields, setAddedFields] = useState([]);
  const [scrollToSelectedField, setScrollToSelectedField] = useState();

  const addFieldsHandler = (fieldNames) => {
    let array = addedFields?.concat(fieldNames);
    array = [...new Set(array)];
    setAddedFields(array);
    setScrollToSelectedField(array?.at(-1));
  };

  useEffect(() => {
    if (addedFields?.length > 0) {
      const element = document.getElementsByClassName(scrollToSelectedField);
      element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [addedFields]);

  useEffect(() => {
    if (taxonomyLoading && !allTaxonomyData && !currentCalendarData) return;
    const requiredFields = currentCalendarData?.forms?.filter((form) => form?.formName === entityClass);
    const requiredTaxonomies = requiredFields[0]?.formFieldProperties?.mandatoryFields?.dynamicFields?.map(
      (field) => field,
    );

    allTaxonomyData?.data?.map((taxonomy) => {
      if (taxonomy?.isDynamicField) {
        const fieldObject = buildFieldObject(taxonomy, requiredTaxonomies);
        setDynamicFields((prev) => [...prev, fieldObject]);
      }
    });
  }, [taxonomyLoading, allTaxonomyData, currentCalendarData]);

  return { dynamicFields, setDynamicFields, addedFields, setAddedFields, addFieldsHandler, scrollToSelectedField };
};
