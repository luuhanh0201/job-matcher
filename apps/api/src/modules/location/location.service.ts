import { BadRequestException, Injectable } from '@nestjs/common';
import dataLocation from 'vietnam-address-database';

type DatabaseItem = {
  type: string;
  name?: string;
  database?: string;
  data?: unknown[];
};

type Province = {
  id: string;
  province_code: string;
  name: string;
  short_name: string;
  code: string;
  place_type: string;
  country: string;
  created_at: string | null;
  updated_at: string | null;
};

type Ward = {
  id: string;
  ward_code: string;
  name: string;
  province_code: string;
  created_at: string | null;
  updated_at: string | null;
};

type AddressDetails = {
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  address?: string;
};

@Injectable()
export class LocationService {
  private readonly locations = dataLocation as unknown as DatabaseItem[];

  private getTableData<T>(tableName: string): T[] {
    const table = this.locations.find(
      (item) => item.type === 'table' && item.name === tableName,
    );

    return (table?.data ?? []) as T[];
  }

  getProvinces(): Province[] {
    return this.getTableData<Province>('provinces');
  }

  getWards(): Ward[] {
    return this.getTableData<Ward>('wards');
  }

  getWardsByProvinceCode(provinceCode: string): Ward[] {
    return this.getWards().filter(
      (ward) => ward.province_code === provinceCode,
    );
  }

  getAddressDetails(
    provinceCode: string,
    wardCode: string,
    address?: string,
  ): AddressDetails {
    const province = this.getProvinces().find(
      (item) => item.province_code === provinceCode,
    );
    const ward = this.getWards().find(
      (item) =>
        item.ward_code === wardCode && item.province_code === provinceCode,
    );
    if (!province) {
      throw new BadRequestException(`Mã tỉnh ${provinceCode} không tồn tại`);
    }
    if (!ward) {
      throw new BadRequestException(
        `Mã xã/phường ${wardCode} không tồn tại trong tỉnh ${province?.name ?? provinceCode}`,
      );
    }
    return {
      provinceCode,
      provinceName: province.name,
      wardCode,
      wardName: ward.name,
      address,
    };
  }
}
