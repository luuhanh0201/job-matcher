import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
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
import { AuthFacebookService } from './auth-facebook.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: AuthGoogleService,
    private readonly facebookAuthService: AuthFacebookService,
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
  @Post('login-facebook')
  async loginWithFacebook(
    @Request() req: Request & { user: User },
    @Body('facebookToken') facebookToken: string,
  ) {
    if (!facebookToken) {
      throw new BadRequestException('Facebook token không được cung cấp');
    }
    const meta = {
      ipAddress: (req as unknown as { ip: string }).ip,
      userAgent: (req as unknown as { headers: Record<string, string> })
        .headers?.['user-agent'],
    };
    return this.facebookAuthService.loginWithFacebook(facebookToken, meta);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @Request() req: Request & { user: User },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token không được cung cấp');
    }
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email không được cung cấp');
    }
    return this.authService.resendVerificationEmail(email);
  }
}
