import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

/**
 * A constant key usada para armazenar metadados de papéis.
 */
export const ROLES_KEY = 'roles';

/**
 * Tipo para permitir exclusão de um ou mais papéis específicos.
 */
export class ExcludeRole {
  /**
   * Creates an instance of the class with the specified roles.
   * @param roles - The roles associated with this instance.
   */
  constructor(public roles: Role[]) { }
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
 * Função auxiliar para excluir um ou mais papéis.
 */
export const Exclude = (...roles: Role[]) => new ExcludeRole(roles);