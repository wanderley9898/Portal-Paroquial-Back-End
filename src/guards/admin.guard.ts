import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from 'src/modules/user/user.service';
import { AuthGuard } from './auth.guard';
import { RolesEnum } from 'src/utils/enums';

@Injectable()
export class AdminGuard extends AuthGuard implements CanActivate {
  constructor(
    protected userService: UserService,
    protected jwtService: JwtService,
  ) {
    super(userService, jwtService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest();

    const { user } = request;
    const isUserAdmin = user.role === RolesEnum.SUPER_ADMIN;

    if (!isUserAdmin) {
      const message = 'Você não possui permissão para executar essa ação.';
      throw new UnauthorizedException(message);
    }

    return true;
  }
}
