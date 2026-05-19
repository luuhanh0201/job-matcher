import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from './Guards/jwt-auth.guard';
import { LocalAuthGuard } from './Guards/local-auth.guard';
import { AuthService } from './auth.service';
import { AuthGoogleService } from './auth-google.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: AuthGoogleService,
  ) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: Request & { user: User }) {
    const meta = {
      ipAddress: (req as unknown as { ip: string }).ip,
      userAgent: (req as unknown as { headers: Record<string, string> })
        .headers?.['user-agent'],
    };
    return this.authService.login(req.user, meta);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: Request & { user: User }) {
    return req.user;
  }

  @Post('refresh-token')
  refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token không được cung cấp');
    }
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @Body('refreshToken') refreshToken: string,
    @Request() req: Request & { user: User },
  ) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token không được cung cấp');
    }
    return this.authService.logout(req.user.id, refreshToken);
  }

  @Post('link-google')
  @UseGuards(JwtAuthGuard)
  async linkGoogleAccount(
    @Request() req: Request & { user: User },
    @Body('googleToken') googleToken: string,
  ) {
    if (!googleToken) {
      throw new BadRequestException('Google token không được cung cấp');
    }
    const meta = {
      ipAddress: (req as unknown as { ip: string }).ip,
      userAgent: (req as unknown as { headers: Record<string, string> })
        .headers?.['user-agent'],
    };
    return this.googleAuthService.linkGoogleAccount(
      req.user.id,
      googleToken,
      meta,
    );
  }

  @Post('login-google')
  async loginWithGoogle(
    @Request() req: Request & { user: User },
    @Body('googleToken') googleToken: string,
  ) {
    if (!googleToken) {
      throw new BadRequestException('Google token không được cung cấp');
    }
    const meta = {
      ipAddress: (req as unknown as { ip: string }).ip,
      userAgent: (req as unknown as { headers: Record<string, string> })
        .headers?.['user-agent'],
    };
    return this.googleAuthService.loginWithGoogle(googleToken, meta);
  }
}
