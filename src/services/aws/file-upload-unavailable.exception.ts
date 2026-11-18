import { HttpStatus, ServiceUnavailableException } from '@nestjs/common';

export const FILE_UPLOAD_UNAVAILABLE_CODE = 'FILE_UPLOAD_UNAVAILABLE';

export class FileUploadUnavailableException extends ServiceUnavailableException {
  constructor(cause?: unknown) {
    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'Service Unavailable',
        code: FILE_UPLOAD_UNAVAILABLE_CODE,
        message:
          'O serviço de upload de arquivos está indisponível. Tente novamente mais tarde.',
      },
      { cause },
    );
  }
}
