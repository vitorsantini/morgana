import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

interface GoogleAuthInput {
  googleId: string;
  email: string;
  name: string;
}

@Injectable()
export class GoogleAuthUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: GoogleAuthInput): Promise<UserEntity> {
    const existingByGoogleId = await this.userRepository.findByGoogleId(input.googleId);
    if (existingByGoogleId) {
      return existingByGoogleId;
    }

    const existingByEmail = await this.userRepository.findByEmail(input.email);
    if (existingByEmail) {
      return existingByEmail;
    }

    return this.userRepository.create({
      email: input.email,
      name: input.name,
      googleId: input.googleId,
    });
  }
}
