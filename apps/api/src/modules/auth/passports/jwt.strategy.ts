/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserService } from './../../user/user.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  fullName: string;
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    const secretKey = configService.get<string>('JWT_SECRET');
    if (!secretKey) {
      throw new Error('JWT_SECRET không tồn tại');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }
  async validate(payload: JwtPayload) {
    const email = payload.email;
    if (!email) {
      throw new Error('Token không hợp lệ');
    }
    const findUser = await this.userService.findByEmail(email);
    if (!findUser) {
      throw new Error('Người dùng không tồn tại');
    }
    const { passwordHash: _, ...user } = findUser;
    return user;
  }
}
