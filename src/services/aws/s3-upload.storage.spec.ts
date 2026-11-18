import { ServiceUnavailableException } from '@nestjs/common';
import { StorageEngine } from 'multer';
import { withUploadServiceUnavailableError } from './s3-upload.storage';

describe('withUploadServiceUnavailableError', () => {
  it('preserves successful upload results', () => {
    const fileInfo = { originalname: 'image.jpg' };
    const storage: StorageEngine = {
      _handleFile: jest.fn((_req, _file, callback) => callback(null, fileInfo)),
      _removeFile: jest.fn((_req, _file, callback) => callback(null)),
    };
    const callback = jest.fn();

    withUploadServiceUnavailableError(storage)._handleFile(
      {} as Parameters<StorageEngine['_handleFile']>[0],
      {} as Express.Multer.File,
      callback,
    );

    expect(callback).toHaveBeenCalledWith(null, fileInfo);
  });

  it('returns a recognizable service error when storage fails', () => {
    const cause = new AggregateError([new Error('ECONNREFUSED')]);
    const storage: StorageEngine = {
      _handleFile: jest.fn((_req, _file, callback) => callback(cause)),
      _removeFile: jest.fn((_req, _file, callback) => callback(null)),
    };
    const callback = jest.fn();

    withUploadServiceUnavailableError(storage)._handleFile(
      {} as Parameters<StorageEngine['_handleFile']>[0],
      {} as Express.Multer.File,
      callback,
    );

    const [error] = callback.mock.calls[0];
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect(error.getStatus()).toBe(503);
    expect(error.getResponse()).toMatchObject({
      code: 'FILE_UPLOAD_UNAVAILABLE',
    });
    expect(error.cause).toBe(cause);
  });
});
