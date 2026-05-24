import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { GoogleAuthUseCase } from '../../application/use-cases/google-auth.use-case';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly googleAuthUseCase: GoogleAuthUseCase,
  ) {
    super({
      clientID: configService.get<string>('google.clientId') ?? '',
      clientSecret: configService.get<string>('google.clientSecret') ?? '',
      callbackURL: configService.get<string>('google.callbackUrl') ?? '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<UserEntity> {
    const email = profile.emails?.[0]?.value ?? '';
    const name = profile.displayName ?? '';

    return this.googleAuthUseCase.execute({
      googleId: profile.id,
      email,
      name,
    });
  }
}
