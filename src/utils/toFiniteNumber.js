/**
 * Converts a value to a finite number, or returns undefined if the value
 * is null, undefined, an empty string, or results in a non-finite number.
 */
export const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};
