/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { CreateUserGoogleDto } from './dto/create-user-google.dto';
import { CreateUserFacebookDto } from './dto/create-user-facebook.dto';
import { UserRole } from '@/common/enum/index.enum';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async createUserLocal(userData: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const user = this.userRepository.create(userData);
    user.passwordHash = passwordHash;
    return this.userRepository.save({
      ...user,
    });
  }
  async createGoogleUser(userData: CreateUserGoogleDto): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save({
      ...user,
    });
  }
  async createFacebookUser(profile: CreateUserFacebookDto): Promise<User> {
    const user = this.userRepository.create(profile);
    return this.userRepository.save({
      ...user,
    });
  }
  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Sai email hoặc mật khẩu');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Tài khoản này đăng ký qua google hoặc facebook, vui lòng đăng nhập lại',
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai email hoặc mật khẩu');
    }
    return user;
  }

  findById(userId: string): Promise<User | null> {
    const user = this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    return user;
  }

  async updateLastLoginAt(userId: string) {
    return this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }
  async findByFacebookId(facebookId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { facebookId } });
  }
  async linkGoogleAccount(userId: string, googleId: string): Promise<User> {
    const existingUser = await this.findByGoogleId(googleId);
    if (existingUser && existingUser.id !== userId) {
      throw new UnauthorizedException(
        'Tài khoản Google đã được liên kết với một người dùng khác',
      );
    }
    await this.userRepository.update(userId, {
      googleId,
      provider: 'google',
    });
    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    return updatedUser;
  }

  async findByVerifyToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { verifyToken: token } });
  }

  async updateVerifyStatus(userId: string, isVerify: boolean): Promise<void> {
    await this.userRepository.update(userId, {
      isVerify,
      verifyToken: undefined,
    });
  }

  async updateVerifyToken(userId: string, verifyToken: string): Promise<void> {
    await this.userRepository.update(userId, {
      verifyToken,
    });
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { passwordHash });
  }

  async registerRecruiter(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    if (user.role === UserRole.RECRUITER) {
      throw new UnauthorizedException('Ban đã là nhà tuyển dụng.');
    }
    user.role = UserRole.RECRUITER;
    await this.userRepository.save(user);
    return user;
  }
}
