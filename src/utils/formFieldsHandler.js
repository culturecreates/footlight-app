export const formFieldsHandler = (forms, entitiesClass) => {
  let formFields = forms?.filter((form) => form?.formName === entitiesClass);
  formFields = formFields?.length > 0 && formFields[0];
  let category = formFields?.formFields?.map((field) => field?.category);
  let unique, fields;
  if (category) unique = [...new Set(category)];
  if (unique)
    fields = formFields?.formFields
      ?.filter((field) => field.category === unique[0])
      ?.sort((a, b) => a?.order - b?.order);

  if (unique?.length > 0) {
    fields = unique?.map((category) => {
      return formFields?.formFields
        ?.filter((field) => field.category === category)
        ?.sort((a, b) => a?.order - b?.order);
    });
  }
  return fields;
};
