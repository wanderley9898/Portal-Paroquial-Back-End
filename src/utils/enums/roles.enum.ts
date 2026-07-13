export enum RolesEnum {
  // Administração Geral
  SUPER_ADMIN = 'super_admin',

  // Administração da Paróquia
  ADMIN = 'admin',

  // Secretaria
  SECRETARY = 'secretary',

  // Comunicação / Mídias
  COMMUNICATION = 'communication',

  // Editor de Conteúdo
  EDITOR = 'editor',
}

export type RolesNameType =
  | RolesEnum.SUPER_ADMIN
  | RolesEnum.ADMIN
  | RolesEnum.SECRETARY
  | RolesEnum.COMMUNICATION
  | RolesEnum.EDITOR;
