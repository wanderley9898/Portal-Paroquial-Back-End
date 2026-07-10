import { UnprocessableEntityException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const DIR_STATIC_FOLDER = path.join(process.cwd(), 'public');
const FILES_FOLDER = 'files';

export const saveFile = (
  file: Express.Multer.File,
  filename: string,
  customFolder?: string,
) => {
  try {
    let imageURL = path.join(DIR_STATIC_FOLDER, FILES_FOLDER);
    if (customFolder) {
      const newDir = path.join(imageURL, customFolder);

      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir);
      }

      imageURL = path.join(imageURL, customFolder);
    }

    imageURL = path.join(imageURL, filename);

    fs.writeFileSync(imageURL, file.buffer);
    return imageURL.replace(DIR_STATIC_FOLDER, '');
  } catch (err) {
    console.error(err);
    throw new UnprocessableEntityException('Oops, erro ao salvar a imagem.');
  }
};
