import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanyEntity } from './entity/company.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationService } from '../location/location.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
  controllers: [CompanyController],
  providers: [CompanyService, LocationService],
})
export class CompanyModule {}
