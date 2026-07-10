export enum RolesEnum {
  // Administração
  SUPER_ADMIN = 'super_admin',

  // Clientes
  CLIENT = 'client',
}

export type RolesNameType = RolesEnum.SUPER_ADMIN | RolesEnum.CLIENT;
