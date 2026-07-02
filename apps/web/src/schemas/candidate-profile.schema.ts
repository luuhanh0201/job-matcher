import z from "zod";

export const avatarFileSchema = z
  .instanceof(File)
  .refine((file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type), {
    message: "Ảnh đại diện chỉ hỗ trợ PNG, JPG hoặc WEBP",
  })
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "Ảnh đại diện không được vượt quá 5MB",
  });
