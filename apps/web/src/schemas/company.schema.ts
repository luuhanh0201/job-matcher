import z from "zod";

const companySizeSchema = z.enum(["1-10", "11-50", "51-200", "200+"]);
const phoneSchema = /^(0|\+84)[0-9]{8,10}$/;
const taxCodeSchema = /^\d{10}(-\d{3})?$/;

const optionalText = (maxLength: number, message: string) =>
  z.string().trim().max(maxLength, message).optional().or(z.literal(""));

const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .url(`${label} phải là URL hợp lệ`)
    .refine((value) => /^https?:\/\//i.test(value), {
      message: `${label} phải bắt đầu bằng http hoặc https`,
    })
    .max(255, `${label} không được vượt quá 255 ký tự`)
    .optional()
    .or(z.literal(""));

export const companyProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên công ty phải từ 2 ký tự")
    .max(160, "Tên công ty không được vượt quá 160 ký tự"),
  shortName: optionalText(50, "Tên viết tắt không được vượt quá 50 ký tự"),
  companySize: companySizeSchema,
  email: z
    .string()
    .trim()
    .email("Email công ty không hợp lệ")
    .max(120, "Email công ty không được vượt quá 120 ký tự")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(phoneSchema, "Số điện thoại công ty không hợp lệ")
    .optional()
    .or(z.literal("")),
  taxCode: z
    .string()
    .trim()
    .regex(
      taxCodeSchema,
      "Mã số thuế phải có 10 chữ số hoặc dạng 10 chữ số-3 chữ số",
    )
    .optional()
    .or(z.literal("")),
  companyType: optionalText(100, "Lĩnh vực công ty không được vượt quá 100 ký tự"),
  website: optionalUrl("Website"),
  provinceCode: z.string().trim().min(1, "Vui lòng chọn tỉnh/thành phố"),
  wardCode: z.string().trim().min(1, "Vui lòng chọn phường/xã"),
  address: optionalText(255, "Địa chỉ chi tiết không được vượt quá 255 ký tự"),
  linkedinUrl: optionalUrl("LinkedIn"),
  facebookUrl: optionalUrl("Facebook"),
  description: optionalText(5000, "Mô tả công ty không được vượt quá 5000 ký tự"),
});

export const logoFileSchema = z
  .instanceof(File)
  .refine((file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type), {
    message: "Logo công ty chỉ hỗ trợ PNG, JPG hoặc WEBP",
  })
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "Logo công ty không được vượt quá 5MB",
  });
