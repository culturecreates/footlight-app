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

  const {
    getElement,
    scrollBlock = 'center',
    scrollOffsetY = 0,
    useAbsoluteScroll = false,
    stickyHeaderSelector = '.sticky-header',
    extraTopOffset = 0,
    correctionDelayMs = 180,
  } = options;

  const getStickyHeaderOffset = () => {
    const stickyHeader = document.querySelector(stickyHeaderSelector);
    if (!stickyHeader) return 0;

    const rect = stickyHeader.getBoundingClientRect();
    const style = window.getComputedStyle(stickyHeader);
    const isSticky = style.position === 'sticky' || style.position === 'fixed';
    const isPinnedToTop = rect.top <= 2;

    if (!isSticky || !isPinnedToTop) return 0;
    return Math.max(rect.height, 0);
  };

  const scrollElementToView = (element) => {
    if (!element) return;

    if (!useAbsoluteScroll) {
      element.scrollIntoView({ block: scrollBlock, behavior: 'smooth' });
      return;
    }

    const targetY = element.getBoundingClientRect().top + window.scrollY - getStickyHeaderOffset() - extraTopOffset;
    window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });

    // A second pass keeps the target aligned after late layout shifts.
    setTimeout(() => {
      const correctedY =
        element.getBoundingClientRect().top + window.scrollY - getStickyHeaderOffset() - extraTopOffset;
      window.scrollTo({ top: Math.max(correctedY, 0), behavior: 'smooth' });
    }, correctionDelayMs);
  };

  const applyOffset = () => {
    if (scrollOffsetY === 0) return;
    setTimeout(() => {
      window.scrollBy({ top: scrollOffsetY, behavior: 'smooth' });
    }, 0);
  };

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
    scrollElementToView(topmostEl);
    applyOffset();
  } else {
    const firstField = error.errorFields[0]?.name;
    if (firstField) {
      if (useAbsoluteScroll) {
        form.scrollToField(firstField, { behavior: 'auto', block: 'start' });
      } else {
        form.scrollToField(firstField, { behavior: 'smooth', block: scrollBlock });
      }

      if (useAbsoluteScroll) {
        const firstFieldName = String(Array.isArray(firstField) ? firstField[0] : firstField);
        const firstFieldEl = getElement
          ? getElement(firstField, firstFieldName)
          : document.getElementsByClassName(firstFieldName)?.[0];
        scrollElementToView(firstFieldEl);
      }

      applyOffset();
    }
  }
};
