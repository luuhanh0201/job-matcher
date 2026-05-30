import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/Guards/jwt-auth.guard';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { User } from '../user/entities/user.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('logoUrl'))
  @Post('create-company')
  async createCompany(
    @Request()
    req: Request & { user: User },
    @Body()
    createCompanyDto: CreateCompanyDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/(png|jpeg|webp)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    logoUrl?: Express.Multer.File,
  ): Promise<CompanyResponseDto> {
    const company = await this.companyService.createCompany(
      createCompanyDto,
      req.user,
      logoUrl,
    );
    return {
      id: company.id,
      name: company.name,
      shortName: company.shortName,
      logoUrl: company.logoUrl,
      companySize: company.companySize,
      email: company.email,
      phone: company.phone,
      taxCode: company.taxCode,
      companyType: company.companyType,
      website: company.website,
      location: company.location
        ? {
            provinceCode: company.location.provinceCode,
            provinceName: company.location.provinceName,
            wardCode: company.location.wardCode,
            wardName: company.location.wardName,
            address: company.location.address,
          }
        : null,
      linkedinUrl: company.linkedinUrl,
      facebookUrl: company.facebookUrl,
      description: company.description,
      isVerified: company.isVerified,
      status: company.status,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      deletedAt: company.deletedAt,
      createdBy: req?.user
        ? {
            id: req.user.id,
            name: req.user.fullName,
            email: req.user.email,
          }
        : null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-company')
  async getMyCompany(
    @Request() req: Request & { user: User },
  ): Promise<CompanyResponseDto[] | null> {
    const recruiterId = req.user.id;
    const company =
      await this.companyService.getCompanyByRecruiterId(recruiterId);
    if (!company) {
      return null;
    }
    return company;
  }
  @Get(':recruiterId/company')
  async getCompanyByRecruiterId(
    @Param('recruiterId') recruiterId: string,
  ): Promise<CompanyResponseDto[] | null> {
    const company =
      await this.companyService.getCompanyByRecruiterId(recruiterId);
    if (!company) {
      return null;
    }
    return company;
  }

  @Get(':id')
  async getCompanyById(
    @Param('id') id: string,
  ): Promise<CompanyResponseDto | null> {
    const company = await this.companyService.getCompanyById(id);
    if (!company) {
      return null;
    }
    return company;
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateCompany(
    @Request() req: Request & { user: User },
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    const newDataCompany = await this.companyService.updateCompany(
      id,
      req.user,
      updateCompanyDto,
    );
    return newDataCompany;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('logo'))
  @Patch(':id/logo')
  async updateCompanyLogo(
    @Request() req: Request & { user: User },
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/(png|jpeg|webp)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    logo: Express.Multer.File,
  ): Promise<CompanyResponseDto> {
    const company = await this.companyService.updateCompanyLogo(
      id,
      req.user,
      logo,
    );

    return {
      id: company.id,
      name: company.name,
      shortName: company.shortName,
      logoUrl: company.logoUrl,
      companySize: company.companySize,
      email: company.email,
      phone: company.phone,
      taxCode: company.taxCode,
      companyType: company.companyType,
      website: company.website,
      location: company.location
        ? {
            provinceCode: company.location.provinceCode,
            provinceName: company.location.provinceName,
            wardCode: company.location.wardCode,
            wardName: company.location.wardName,
            address: company.location.address,
          }
        : null,
      linkedinUrl: company.linkedinUrl,
      facebookUrl: company.facebookUrl,
      description: company.description,
      isVerified: company.isVerified,
      status: company.status,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      deletedAt: company.deletedAt,
      createdBy: company.createdBy,
    };
  }
}
