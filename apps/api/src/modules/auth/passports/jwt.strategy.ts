import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from './../../user/user.service';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '@/common/enum/index.enum';
import { JwtPayload } from '@/common/type/JwtPayload.type';
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
    if (payload.type !== 'access') {
      throw new UnauthorizedException(
        'Token không hợp lệ cho thao tác này (yêu cầu access token)',
      );
    }
    const email = payload.email;
    if (!email) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    const findUser = await this.userService.findByEmail(email);
    if (!findUser) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    if (findUser.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Tài khoản đã bị vô hiệu hoá hoặc bị cấm',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _pw, ...user } = findUser;
    return user;
  }
}
