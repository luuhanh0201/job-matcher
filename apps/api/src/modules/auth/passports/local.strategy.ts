import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '@/modules/auth/auth.service';
import { Injectable } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }
  async validate(email: string, password: string) {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new Error('Sai email hoặc mật khẩu');
    }
    return user;
  }
}
