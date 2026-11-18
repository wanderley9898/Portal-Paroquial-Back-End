import { StorageEngine } from 'multer';
import { FileUploadUnavailableException } from './file-upload-unavailable.exception';

export function withUploadServiceUnavailableError(
  storage: StorageEngine,
): StorageEngine {
  return {
    _handleFile(req, file, callback) {
      try {
        storage._handleFile(req, file, (error, info) => {
          if (error) {
            return callback(new FileUploadUnavailableException(error));
          }

          callback(null, info);
        });
      } catch (error) {
        callback(new FileUploadUnavailableException(error));
      }
    },
    _removeFile(req, file, callback) {
      storage._removeFile(req, file, callback);
    },
  };
}
