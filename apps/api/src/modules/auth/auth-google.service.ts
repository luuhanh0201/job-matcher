import { OAuth2Client } from 'google-auth-library';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateUserGoogleDto } from '../user/dto/create-user-google.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthGoogleService {
  private googleClient: OAuth2Client;
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client({
      clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
    });
  }

  async validateGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Google token không hợp lệ');
      }
      return payload;
    } catch (error) {
      console.log(error);
      throw new Error('Xác thực Google token thất bại');
    }
  }
  async linkGoogleAccount(
    userId: string,
    googleToken: string,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    const payload = await this.validateGoogleToken(googleToken);
    const googleId = payload.sub;

    const existingUser = await this.userService.findByGoogleId(googleId);
    if (existingUser && existingUser.id !== userId) {
      throw new UnauthorizedException(
        'Tài khoản Google đã được liên kết với một người dùng khác',
      );
    }

    const user = await this.userService.linkGoogleAccount(userId, googleId);
    return this.authService.login(user, meta);
  }

  async loginWithGoogle(token: string, meta: { ipAddress?: string; userAgent?: string }) {
    const payload = await this.validateGoogleToken(token);

    if (!payload?.email) {
      throw new Error('Google token không chứa email');
    }

    const user = await this.userService.findByEmail(payload.email);
    if (user) {
      if (!user.googleId) {
        await this.userService.linkGoogleAccount(user.id, payload.sub);
      }
      return this.authService.login(user, meta);
    } else {
      const userData: CreateUserGoogleDto = {
        email: payload.email,
        fullName: payload.name || 'Người dùng Google',
        googleId: payload.sub,
        provider: 'google',
      };
      const newUser = await this.userService.createGoogleUser(userData);
      return this.authService.login(newUser, meta);
    }
  }
}
