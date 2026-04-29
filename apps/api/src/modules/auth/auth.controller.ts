import { UserService } from '@/modules/user/user.service';
import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { LocalAuthGuard } from './Guards/local-auth.guard';
import { JwtAuthGuard } from './Guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: Request & { user: User }) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: Request & { user: User }) {
    return req.user;
  }
}
