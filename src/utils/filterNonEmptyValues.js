export const filterNonEmptyValues = (obj) => {
  if (!obj) return undefined;
  const filteredObj = Object.fromEntries(Object.entries(obj).filter(([, value]) => value.trim() !== ''));

  return Object.keys(filteredObj).length > 0 ? filteredObj : undefined;
};
