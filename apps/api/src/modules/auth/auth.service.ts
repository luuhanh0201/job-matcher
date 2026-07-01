import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { UserSession } from './entities/user-session.entity';
import { UserStatus } from '@/common/enum/index.enum';
import { JwtPayload } from '@/common/type/JwtPayload.type';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    private readonly mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    console.log('Registering user with email:', createUserDto.email);
    const existing = await this.userService.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException(
        'Email đã tồn tại, vui lòng sử dụng email khác',
      );
    }

    const verifyToken = randomUUID();

    const user = await this.userService.createUserLocal({
      ...createUserDto,
      verifyToken,
    });
    await this.mailService.sendVerificationEmail(user.email, verifyToken);
    return {
      message:
        'Đăng ký thành công, vui lòng kiểm tra email để xác minh tài khoản',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerify: user.isVerify,
        status: user.status,
        createdAt: user.createdAt,
      },
    };
  }

  async login(user: User, meta?: { ipAddress?: string; userAgent?: string }) {
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Tài khoản đã bị vô hiệu hoá hoặc bị cấm',
      );
    }
    if (!user.isVerify && !user.provider) {
      throw new UnauthorizedException(
        'Tài khoản chưa được xác minh, vui lòng kiểm tra email',
      );
    }

    const basePayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = this.jwtService.sign({
      ...basePayload,
      type: 'access',
    });

    const refreshToken = this.jwtService.sign(
      { ...basePayload, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      },
    );

    await this.saveSession(user.id, refreshToken, meta);
    await this.userService.updateLastLoginAt(user.id);

    return { accessToken, refreshToken };
  }

  async saveSession(
    userId: string,
    refreshToken: string,
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const session = this.userSessionRepository.create({
      userId,
      sessionToken: randomUUID(),
      refreshToken: hashedToken,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    });
    return this.userSessionRepository.save(session);
  }

  async refresh(rawRefreshToken: string) {
    // 1. Xác minh chữ ký và thời hạn
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(rawRefreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token không phải refresh token');
    }

    // 2. Tìm phiên active và so sánh hash
    const sessions = await this.userSessionRepository.find({
      where: { userId: payload.sub, isActive: true },
    });

    let validSession: UserSession | undefined;
    for (const session of sessions) {
      if (
        session.refreshToken &&
        (await bcrypt.compare(rawRefreshToken, session.refreshToken))
      ) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã bị thu hồi',
      );
    }

    // 3. Rotate: vô hiệu hoá phiên cũ, cấp cặp token mới
    await this.userSessionRepository.update(validSession.id, {
      isActive: false,
      revokedAt: new Date(),
      revokeReason: 'Rotated',
    });

    const user = await this.userService.findById(payload.sub);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Người dùng không tồn tại hoặc tài khoản đã bị vô hiệu hoá',
      );
    }

    return this.login(user);
  }

  async logout(userId: string, rawRefreshToken: string) {
    const sessions = await this.userSessionRepository.find({
      where: { userId, isActive: true },
    });

    for (const session of sessions) {
      if (
        session.refreshToken &&
        (await bcrypt.compare(rawRefreshToken, session.refreshToken))
      ) {
        await this.userSessionRepository.update(session.id, {
          isActive: false,
          revokedAt: new Date(),
          revokeReason: 'Logout',
        });
        break;
      }
    }

    return { message: 'Đăng xuất thành công' };
  }

  async verifyEmail(token: string) {
    const user = await this.userService.findByVerifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Token xác minh không hợp lệ');
    }

    if (user.isVerify) {
      return {
        message: 'Email đã được xác minh trước đó',
        data: { isVerify: true },
      };
    }

    await this.userService.updateVerifyStatus(user.id, true);

    return {
      message: 'Xác minh email thành công',
      data: { isVerify: true },
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string | undefined,
    newPassword: string,
  ) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    if (user.passwordHash) {
      // User has existing password — must verify current password
      if (!currentPassword) {
        throw new BadRequestException('Vui lòng cung cấp mật khẩu hiện tại');
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new BadRequestException('Mật khẩu hiện tại không đúng');
      }
    }
    // If no passwordHash (social login user), allow setting new password directly

    await this.userService.updatePassword(userId, newPassword);
    return { message: 'Đổi mật khẩu thành công' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email không tồn tại');
    }

    if (user.isVerify) {
      return {
        message: 'Email đã được xác minh',
        data: { isVerify: true },
      };
    }

    const verifyToken = randomUUID();
    await this.userService.updateVerifyToken(user.id, verifyToken);
    await this.mailService.sendVerificationEmail(user.email, verifyToken);

    return {
      message: 'Email xác minh đã được gửi lại',
      data: { email: user.email },
    };
  }
}
