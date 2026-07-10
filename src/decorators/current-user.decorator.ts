import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/entities';

/**
 * Extrai o usuário autenticado do request atual.
 * Funciona em conjunto com o AuthGuard.
 *
 * Exemplo:
 * ```ts
 * @Get()
 * findAll(@CurrentUser() user: User) {
 *   return this.service.findAll(user);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
