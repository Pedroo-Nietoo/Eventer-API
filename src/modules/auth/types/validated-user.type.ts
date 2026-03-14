import { User } from '../../users/entities/user.entity';

export type ValidatedUser = Omit<User, 'password'>;