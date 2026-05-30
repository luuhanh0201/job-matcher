import z from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được rỗng"),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Tên không được rỗng"),
    email: z.string().trim().email("Email không hợp lệ"),
    password: z.string().min(8, "Ít nhất 8 ký tự"),
    confirmPassword: z.string().min(8, "Ít nhất 8 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"], // gắn lỗi vào field này
  });