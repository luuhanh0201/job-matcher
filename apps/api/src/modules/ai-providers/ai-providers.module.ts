import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAdaptersModule } from '@/modules/ai/adapters/ai-adapters.module';
import { AiUsageModule } from '@/modules/ai-usage/ai-usage.module';
import { AiProviderEntity } from './entities/ai-provider.entity';
import { AiProvidersService } from './ai-providers.service';
import { AiProvidersController } from './ai-providers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiProviderEntity]),
    AiAdaptersModule,
    AiUsageModule,
  ],
  controllers: [AiProvidersController],
  providers: [AiProvidersService],
  exports: [AiProvidersService],
})
export class AiProvidersModule {}
