import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { GoogleAuthUseCase } from '../application/use-cases/google-auth.use-case';
import { PrismaUserRepository } from '../infrastructure/repositories/prisma-user.repository';
import { JwtStrategy } from '../infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../infrastructure/strategies/jwt-refresh.strategy';
import { GoogleStrategy } from '../infrastructure/strategies/google.strategy';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    GoogleAuthUseCase,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class AuthModule {}
