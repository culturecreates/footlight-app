const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

export const normalizeEventJsonLd = (parsedJsonLd) => {
  if (!isPlainObject(parsedJsonLd)) return parsedJsonLd;

  const normalized = { ...parsedJsonLd };

  return normalized;
};
