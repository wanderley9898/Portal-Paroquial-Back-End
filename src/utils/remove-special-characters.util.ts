export const removeSpecialCharacters = (value: string | number): string => {
  return value.toString()?.replace(/\D/g, '');
};
