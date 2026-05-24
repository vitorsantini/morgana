import { UserEntity } from '../entities/user.entity';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash?: string;
  googleId?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByGoogleId(googleId: string): Promise<UserEntity | null>;
  create(data: CreateUserData): Promise<UserEntity>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
