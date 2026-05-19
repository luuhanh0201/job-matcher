import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { FacebookProfile } from '@/common/type/FacebookProfile.type';

@Injectable()
export class AuthFacebookService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async validateFacebookToken(token: string) {
    try {
      const url = new URL('https://graph.facebook.com/me');
      url.searchParams.append('access_token', token);
      url.searchParams.append('fields', 'id,name,email');
      const response = await fetch(url.toString());
      const profile = (await response.json()) as FacebookProfile;
      if (!response.ok || !profile.id) {
        throw new UnauthorizedException('Facebook token không hợp lệ');
      }
      return profile;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Xác thực Facebook token thất bại');
    }
  }

  async loginWithFacebook(
    token: string,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    const payload = await this.validateFacebookToken(token);

    const user = await this.userService.findByFacebookId(payload.id);
    if (user) {
      return this.authService.login(user, meta);
    }

    const email = payload.email || `fb_${payload.id}@placeholder.local`;

    const newUser = await this.userService.createFacebookUser({
      email,
      fullName: payload.name,
      facebookId: payload.id,
      provider: 'facebook',
    });
    return this.authService.login(newUser, meta);
  }
}
