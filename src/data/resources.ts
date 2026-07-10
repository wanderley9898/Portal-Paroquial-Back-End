import { Permission, PermissionAllowed } from 'src/utils/enums';

export const resources = {
  registers: {
    title: 'Cadastros',
    items: [
      {
        name: 'Grupos de Permissões',
        key: Permission.PERMISSION_GROUP,
        permissions: [
          { label: 'Somente leitura', id: PermissionAllowed.READ },
          { label: 'Leitura & Escrita', id: PermissionAllowed.READ_WRITE },
        ],
      },
      {
        name: 'Usuários',
        key: Permission.USERS_MANAGEMENT,
        permissions: [
          { label: 'Somente leitura', id: PermissionAllowed.READ },
          { label: 'Leitura & Escrita', id: PermissionAllowed.READ_WRITE },
        ],
      },
    ],
  },
};
