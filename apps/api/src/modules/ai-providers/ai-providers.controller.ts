import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/Guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enum/index.enum';
import { User } from '@/modules/user/entities/user.entity';
import { AiProvidersService } from './ai-providers.service';
import { CreateAiProviderDto } from './dto/create-ai-provider.dto';
import { UpdateAiProviderDto } from './dto/update-ai-provider.dto';
import { AiProviderResponseDto } from './dto/ai-provider-response.dto';

@Controller('admin/ai-providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AiProvidersController {
  constructor(private readonly aiProvidersService: AiProvidersService) {}

  @Post()
  async create(
    @Body() dto: CreateAiProviderDto,
    @Request() req: Request & { user: User },
  ): Promise<AiProviderResponseDto> {
    return this.aiProvidersService.create(dto, req.user);
  }

  @Get()
  async findAll(): Promise<AiProviderResponseDto[]> {
    return this.aiProvidersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AiProviderResponseDto> {
    return this.aiProvidersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAiProviderDto,
  ): Promise<AiProviderResponseDto> {
    return this.aiProvidersService.update(id, dto);
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string): Promise<AiProviderResponseDto> {
    return this.aiProvidersService.activate(id);
  }

  @Post(':id/test-connection')
  async testConnection(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.aiProvidersService.testConnection(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.aiProvidersService.remove(id);
  }
}
