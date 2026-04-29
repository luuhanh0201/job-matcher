import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { UserService } from '@/modules/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
