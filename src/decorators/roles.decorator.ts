import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from 'src/utils/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolesEnum[]) => SetMetadata(ROLES_KEY, roles);
