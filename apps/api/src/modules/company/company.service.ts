import { CompanyEntity } from './entity/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConflictException, Injectable } from '@nestjs/common';
import { LocationService } from '../location/location.service';
import { User } from '../user/entities/user.entity';
import { isPostgresUniqueViolation } from '@/common/helpers/unique-violation.helper';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    private readonly locationService: LocationService,
  ) {}
  async createCompany(
    createCompanyDto: CreateCompanyDto,
    user: User,
  ): Promise<CompanyEntity> {
    const companyName = createCompanyDto.name.trim();
    const existingCompany = await this.companyRepository.findOne({
      where: { name: companyName },
    });

    if (existingCompany) {
      throw new ConflictException(`Công ty với tên ${companyName} đã tồn tại`);
    }

    const detailLocation = this.locationService.getAddressDetails(
      createCompanyDto.location.provinceCode,
      createCompanyDto.location.wardCode,
      createCompanyDto.location.address,
    );
    const createdBy = {
      id: user.id,
      name: user.fullName,
      email: user.email,
    };
    const company = this.companyRepository.create({
      ...createCompanyDto,
      name: companyName,
      location: detailLocation,
      createdBy,
    });

    try {
      return await this.companyRepository.save(company);
    } catch (error) {
      if (isPostgresUniqueViolation(error)) {
        throw new ConflictException(
          `Công ty với tên ${companyName} đã tồn tại`,
        );
      }
      throw error;
    }
  }
}
