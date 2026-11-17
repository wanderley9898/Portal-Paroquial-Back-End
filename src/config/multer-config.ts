// multer-config.ts
import { Options } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import envs from './configuration';
import { s3Config } from './s3-config';
import multerS3 = require('multer-s3');

const s3Settings = envs().s3;
const appFolder = s3Settings.folder;

export function getMulterConfig(isPublic: boolean): Options {
  const allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.mp4',
    '.mov',
    '.avi',
    '.mkv',
  ];

  const fileFilter: Options['fileFilter'] = (_, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return cb(new Error('Apenas imagens e videos sao permitidos.'));
    }

    cb(null, true);
  };

  if (!s3Settings.enabled) {
    return {
      fileFilter,
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    };
  }

  return {
    storage: multerS3({
      s3: s3Config,
      bucket: s3Settings.bucketName,
      acl: isPublic ? 'public-read' : undefined,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (_, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const baseName = path.parse(file.originalname).name.replace(/\s/g, '');
        const uuid = uuidv4();

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
        let typeFolder = 'others';

        if (imageExtensions.includes(extension)) typeFolder = 'images';
        else if (videoExtensions.includes(extension)) typeFolder = 'videos';

        const key = `${appFolder}/${typeFolder}/${baseName}-${uuid}${extension}`;
        cb(null, key);
      },
    }),
    fileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024,
    },
  };
}
