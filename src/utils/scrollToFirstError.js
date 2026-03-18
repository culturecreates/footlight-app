/**
 * Scrolls to the topmost invalid field after antd form validation fails.
 *
 * @param {object} error       - The error object from validateFields().catch()
 * @param {object} form        - The antd form instance (used as final fallback)
 * @param {object} [options]
 * @param {Function} [options.getElement]
 *   (fieldNamePath, fieldName) => HTMLElement | null | undefined
 *   Custom element resolver called once per errorField.
 *   Defaults to document.getElementsByClassName(fieldName)?.[0]
 */
export const scrollToFirstError = (error, form, options = {}) => {
  if (!error?.errorFields?.length) return;

  const { getElement } = options;
  let topmostEl = null;
  let topmostTop = Infinity;

  for (const { name: fieldNamePath } of error.errorFields) {
    const fieldName = String(Array.isArray(fieldNamePath) ? fieldNamePath[0] : fieldNamePath);
    const el = getElement ? getElement(fieldNamePath, fieldName) : document.getElementsByClassName(fieldName)?.[0];

    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (top < topmostTop) {
        topmostTop = top;
        topmostEl = el;
      }
    }
  }

  if (topmostEl) {
    topmostEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
  } else {
    const firstField = error.errorFields[0]?.name;
    if (firstField) form.scrollToField(firstField, { behavior: 'smooth', block: 'center' });
  }
};
