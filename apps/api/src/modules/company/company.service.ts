import { CompanyEntity, CompanyStatus } from './entity/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { LocationService } from '../location/location.service';
import { User } from '../user/entities/user.entity';
import { isPostgresUniqueViolation } from '@/common/helpers/unique-violation.helper';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UploadCloudinaryService } from '../upload-cloudinary/upload-cloudinary.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    private readonly locationService: LocationService,
    private readonly cloudinaryService: UploadCloudinaryService,
  ) {}
  async createCompany(
    createCompanyDto: CreateCompanyDto,
    user: User,
    logo?: Express.Multer.File,
  ): Promise<CompanyEntity> {
    const companyName = createCompanyDto.name.trim();
    const existingCompany = await this.companyRepository
      .createQueryBuilder('company')
      .where('LOWER(company.name) = LOWER(:companyName)', { companyName })
      .getOne();

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
    const logoUrl = logo
      ? await this.cloudinaryService.uploadImage(logo)
      : null;

    const company = this.companyRepository.create({
      ...createCompanyDto,
      name: companyName,
      location: detailLocation,
      createdBy,
      logoUrl: logoUrl ? logoUrl.secure_url : undefined,
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
  async getCompanyById(id: string): Promise<CompanyEntity | null> {
    const company = await this.companyRepository.findOne({
      where: { id },
    });
    if (!company) {
      throw new BadRequestException(
        `Công ty không tồn tại hoặc chưa đăng ký tại Job Matcher`,
      );
    }
    return company;
  }
  async getCompanyByRecruiterId(
    recruiterId: string,
  ): Promise<CompanyEntity[] | null> {
    console.log(recruiterId);
    const company = await this.companyRepository
      .createQueryBuilder('company')
      .where("company.created_by ->> 'id' = :recruiterId", { recruiterId })
      .getMany();
    if (!company || company.length === 0) {
      throw new BadRequestException(
        `Vui lòng đăng ký hồ sơ công ty trước khi đăng tuyển dụng`,
      );
    }
    return company;
  }

  async updateCompany(
    id: string,
    user: User,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyEntity> {
    const company = await this.getCompanyById(id);
    if (!company) {
      throw new BadRequestException(
        `Công ty không tồn tại hoặc chưa đăng ký tại Job Matcher`,
      );
    }
    this.assertCompanyOwnership(company, user);

    let normalizedLocation = company.location;
    if (updateCompanyDto.location) {
      normalizedLocation = this.locationService.getAddressDetails(
        updateCompanyDto.location.provinceCode,
        updateCompanyDto.location.wardCode,
        updateCompanyDto.location.address,
      );
    }

    const normalizedName = updateCompanyDto.name?.trim();

    const updatedBy = {
      id: user.id,
      name: user.fullName,
      email: user.email,
    };
    const newCompany = this.companyRepository.merge(company, {
      ...updateCompanyDto,
      name: normalizedName,
      location: normalizedLocation,
      updatedBy,
    });
    // Công ty bị từ chối sau khi chỉnh sửa sẽ được gửi duyệt lại
    if (company.status === CompanyStatus.REJECTED) {
      newCompany.status = CompanyStatus.PENDING_APPROVAL;
      newCompany.rejectionReason = null;
    }
    try {
      return await this.companyRepository.save(newCompany);
    } catch (error) {
      if (isPostgresUniqueViolation(error)) {
        throw new ConflictException(
          `Công ty với tên ${updateCompanyDto.name} đã tồn tại`,
        );
      }
      throw error;
    }
  }

  async updateCompanyLogo(
    id: string,
    user: User,
    logo: Express.Multer.File,
  ): Promise<CompanyEntity> {
    const company = await this.getCompanyById(id);
    if (!company) {
      throw new BadRequestException(
        `Công ty không tồn tại hoặc chưa đăng ký tại Job Matcher`,
      );
    }
    this.assertCompanyOwnership(company, user);

    const uploadResult = await this.cloudinaryService.uploadImage(logo);
    const updatedBy = {
      id: user.id,
      name: user.fullName,
      email: user.email,
    };

    const newCompany = this.companyRepository.merge(company, {
      logoUrl: uploadResult.secure_url,
      updatedBy,
    });

    return this.companyRepository.save(newCompany);
  }

  private assertCompanyOwnership(company: CompanyEntity, user: User): void {
    if (!company.createdBy?.id || company.createdBy.id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền cập nhật công ty này');
    }
  }
}
