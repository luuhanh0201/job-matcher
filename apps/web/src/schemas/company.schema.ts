import z from "zod";

const companySizeSchema = z.enum(["1-10", "11-50", "51-200", "200+"]);

export const companyProfileSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên công ty"),
  shortName: z.string().optional(),
  companySize: companySizeSchema,
  email: z.string().optional(),
  phone: z.string().optional(),
  taxCode: z.string().optional(),
  companyType: z.string().optional(),
  website: z.string().optional(),
  provinceCode: z.string().trim().min(1, "Vui lòng chọn tỉnh/thành phố"),
  wardCode: z.string().trim().min(1, "Vui lòng chọn phường/xã"),
  address: z.string().optional(),
  linkedinUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  description: z.string().optional(),
});

export const logoFileSchema = z
  .instanceof(File)
  .refine((file) => file.type.startsWith("image/"), {
    message: "Logo công ty phải là file hình ảnh",
  })
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "Logo công ty không được vượt quá 5MB",
  });
