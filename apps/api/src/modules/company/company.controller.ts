import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/Guards/jwt-auth.guard';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { User } from '../user/entities/user.entity';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-company')
  async createCompany(
    @Request() req: Request & { user: User },
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<CompanyResponseDto> {
    const company = await this.companyService.createCompany(
      createCompanyDto,
      req.user,
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
}
