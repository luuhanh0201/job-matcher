import { authFetchJson } from "@/services/auth.service";
import type { Province, Ward } from "@/types/location";

export async function getProvinces() {
  return authFetchJson<Province[]>(
    "/location/provinces",
    {
      method: "GET",
    },
    "Không thể tải danh sách tỉnh/thành phố",
  );
}

export async function getWardsByProvinceCode(provinceCode: string) {
  return authFetchJson<Ward[]>(
    `/location/wards/${provinceCode}`,
    {
      method: "GET",
    },
    "Không thể tải danh sách phường/xã",
  );
}
