export const parseToJson = (value: unknown) => {
  if (typeof value === 'string') {
    return JSON.parse(value);
  }

  return null;
};
