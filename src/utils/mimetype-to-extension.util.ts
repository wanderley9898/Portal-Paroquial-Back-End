export const mimetypeToExtension = (mimetype: string) => {
  const dict = {
    'image/png': '.png',
    'image/jpeg': '.jpeg',
    'image/jpg': '.jpg',
  };

  return dict[mimetype];
};
