export const tryTransformToDate = (value: string | Date) => {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
};
