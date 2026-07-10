import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import envs from 'src/config/configuration';

@Injectable()
export class EnvApiKeyGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
      throw new UnauthorizedException('Permissão negada.');
    }

    const apiKeyEnv = envs().apiKey;
    const isDifferent = apiKey !== apiKeyEnv;
    if (isDifferent) {
      throw new UnauthorizedException('Permissão negada.');
    }

    return true;
  }
}
