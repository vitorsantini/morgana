import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtRefreshGuard } from '../../../shared/presentation/guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../../../shared/presentation/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { UserEntity } from '../domain/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Register with email and password' })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUseCase.execute(dto);
    return { data: this.buildTokens(user) };
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const user = await this.loginUseCase.execute(dto);
    return { data: this.buildTokens(user) };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@CurrentUser() user: JwtPayload) {
    const accessToken = this.jwtService.sign(
      { sub: user.sub, email: user.email },
      {
        secret: this.configService.get<string>('jwt.secret')!,
        expiresIn: this.configService.get('jwt.expiresIn') as any,
      },
    );
    return { data: { accessToken } };
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: JwtPayload) {
    return { data: { id: user.sub, email: user.email } };
  }

  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {}

  @ApiOperation({ summary: 'Google OAuth callback' })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  googleCallback(@CurrentUser() user: UserEntity) {
    const tokens = this.buildTokens(user);
    const frontendUrl = this.configService.get<string>('frontendUrl');
    const params = new URLSearchParams({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    return { url: `${frontendUrl}/auth/callback?${params.toString()}` };
  }

  private buildTokens(user: UserEntity | JwtPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: JwtPayload = {
      sub: 'id' in user ? user.id : user.sub,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret')!,
      expiresIn: this.configService.get('jwt.expiresIn') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret')!,
      expiresIn: this.configService.get('jwt.refreshExpiresIn') as any,
    });

    return { accessToken, refreshToken };
  }
}
