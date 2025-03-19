import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

/**
 * A constant key usada para armazenar metadados de papéis.
 */
export const ROLES_KEY = 'roles';

/**
 * Tipo para permitir exclusão de um papel específico.
 */
export class ExcludeRole {
  constructor(public role: Role) {}
}

/**
 * Decorador que define papéis para um manipulador de rota.
 * 
 * Pode incluir ou excluir papéis específicos.
 *
 * @param {...(Role | ExcludeRole)[]} roles - Papéis ou exclusões de papéis.
 * @returns {CustomDecorator<string>} - Um decorador personalizado.
 */
export const Roles = (...roles: (Role | ExcludeRole)[]) =>
  SetMetadata(ROLES_KEY, roles);

/**
 * Função auxiliar para excluir um papel.
 */
export const Exclude = (role: Role) => new ExcludeRole(role);
