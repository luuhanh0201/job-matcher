import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existing = await this.userService.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException(
        'Email đã tồn tại, vui lòng sử dụng email khác',
      );
    }

    const user = await this.userService.create(createUserDto);
    return {
      message: 'Đăng ký thành công',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    };
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
    await this.userService.updateLastLoginAt(user.id);
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
