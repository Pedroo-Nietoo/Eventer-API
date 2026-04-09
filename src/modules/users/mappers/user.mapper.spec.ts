import { UserMapper } from './user.mapper';
import { UserRole } from '@common/enums/role.enum';

describe('UserMapper', () => {
 const baseDate = new Date('2026-05-10T15:00:00Z');

 describe('toResponse', () => {
  it('deve mapear a entidade User para UserResponseDto ignorando campos sensíveis', () => {

   const mockUserEntity = {
    id: 'uuid-user-123',
    username: 'pedronieto',
    email: 'pedro@test.com',
    password: 'hash-super-secreto-que-nao-pode-vazar',
    profilePicture: 'https://cdn.nearbyapi.com/users/foto.jpg',
    role: UserRole.USER,
    createdAt: baseDate,
    updatedAt: baseDate,
   } as any;


   const result = UserMapper.toResponse(mockUserEntity);


   expect(result).toEqual({
    id: 'uuid-user-123',
    username: 'pedronieto',
    email: 'pedro@test.com',
    profilePicture: 'https://cdn.nearbyapi.com/users/foto.jpg',
    role: UserRole.USER,
    createdAt: baseDate,
    updatedAt: baseDate,
   });


   expect((result as any).password).toBeUndefined();
  });

  it('deve lidar corretamente com um usuário sem foto de perfil (undefined/null)', () => {

   const mockUserEntity = {
    id: 'uuid-user-456',
    username: 'usuario_sem_foto',
    email: 'semfoto@test.com',

    role: UserRole.USER,
   } as any;


   const result = UserMapper.toResponse(mockUserEntity);


   expect(result.id).toBe('uuid-user-456');
   expect(result.profilePicture).toBeUndefined();
  });
 });

 describe('toResponseList', () => {
  it('deve mapear um array de entidades User para um array de DTOs', () => {

   const mockUsers = [
    { id: '1', username: 'user1', email: 'u1@test.com' },
    { id: '2', username: 'user2', email: 'u2@test.com' },
   ] as any[];


   const result = UserMapper.toResponseList(mockUsers);


   expect(result).toHaveLength(2);
   expect(result[0].id).toBe('1');
   expect(result[0].username).toBe('user1');
   expect(result[1].id).toBe('2');
   expect(result[1].username).toBe('user2');
  });

  it('deve retornar um array vazio se receber um array vazio', () => {
   expect(UserMapper.toResponseList([])).toEqual([]);
  });
 });
});