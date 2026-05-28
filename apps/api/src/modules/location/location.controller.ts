import { Body, Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service';

// type Wards = {
//   id: string;
//   name: string;
//   ward_code: string;
//   province_code: string;
//   created_at: string;
//   updated_at: string;
// };
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}
  @Get('provinces')
  getProvinces() {
    return this.locationService.getProvinces();
  }
  @Get('wards/:provinceCode')
  getWardsByProvinceCode(@Param('provinceCode') provinceCode: string): any[] {
    return this.locationService.getWardsByProvinceCode(provinceCode);
  }
  @Get('address-details/:provinceCode/:wardCode')
  getAddressDetails(
    @Param('provinceCode') provinceCode: string,
    @Param('wardCode') wardCode: string,
    @Body('address') address?: string,
  ) {
    return this.locationService.getAddressDetails(
      provinceCode,
      wardCode,
      address,
    );
  }
}
