import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import configuration from 'src/config/configuration';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    protected userService: UserService,
    protected jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      throw new UnauthorizedException('Permissão negada.');
    }

    const [, token] = request.headers.authorization.split(' ');

    if (!token) {
      throw new UnauthorizedException('Permissão negada.');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: configuration().jwt.secret,
      }) as any;

      const user = await this.userService.findByEmail(decoded.email);

      if (!user) {
        throw new UnauthorizedException('Permissão negada.');
      }

      request.user = user;

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new UnauthorizedException('Permissão negada.');
    }
  }
}
