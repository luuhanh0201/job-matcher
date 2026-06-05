import z from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const jobPostFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Tên vị trí phải từ 3 ký tự")
      .max(160, "Tên vị trí không được vượt quá 160 ký tự"),
    companyId: z.string().uuid("Vui lòng chọn công ty hợp lệ"),
    department: z
      .string()
      .trim()
      .min(2, "Bộ phận phải từ 2 ký tự")
      .max(100, "Bộ phận không được vượt quá 100 ký tự"),
    jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "FREELANCE"]),
    workMode: z.enum(["ONSITE", "HYBRID", "REMOTE"]),
    seniorityLevel: z.enum([
      "NO_EXPERIENCE",
      "INTERN",
      "JUNIOR",
      "MID",
      "SENIOR",
      "LEAD",
    ]),
    salaryType: z.enum(["NEGOTIABLE", "RANGE", "FIXED"]),
    salaryMin: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number({ message: "Mức lương tối thiểu phải là số" })
        .min(0, "Mức lương tối thiểu không được âm")
        .optional(),
    ),
    salaryMax: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number({ message: "Mức lương tối đa phải là số" })
        .min(0, "Mức lương tối đa không được âm")
        .optional(),
    ),
    currency: z.enum(["VND", "USD", "EUR", "GBP"]),
    description: z
      .string()
      .trim()
      .min(20, "Mô tả công việc phải từ 20 ký tự")
      .max(5000, "Mô tả công việc không được vượt quá 5000 ký tự"),
    requirements: z
      .string()
      .trim()
      .min(20, "Yêu cầu công việc phải từ 20 ký tự")
      .max(5000, "Yêu cầu công việc không được vượt quá 5000 ký tự"),
    responsibilities: z
      .string()
      .trim()
      .max(5000, "Trách nhiệm công việc không được vượt quá 5000 ký tự")
      .optional()
      .or(z.literal("")),
    benefits: z
      .string()
      .trim()
      .max(5000, "Phúc lợi không được vượt quá 5000 ký tự")
      .optional()
      .or(z.literal("")),
    skillsText: z
      .string()
      .trim()
      .max(500, "Danh sách kỹ năng không được vượt quá 500 ký tự")
      .optional()
      .or(z.literal("")),
    quantity: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number({ message: "Số lượng tuyển phải là số" })
        .int("Số lượng tuyển phải là số nguyên")
        .min(1, "Số lượng tuyển tối thiểu là 1")
        .optional(),
    ),
    status: z.enum(["DRAFT", "OPEN"]),
    expiredAt: z
      .string()
      .min(1, "Vui lòng chọn hạn ứng tuyển")
      .refine((value) => {
        const date = new Date(value);
        return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
      }, "Hạn ứng tuyển phải là thời điểm trong tương lai"),
  })
  .superRefine((form, context) => {
    if (form.salaryType === "RANGE") {
      if (form.salaryMin === undefined || form.salaryMax === undefined) {
        context.addIssue({
          code: "custom",
          path: ["salaryMin"],
          message: "Vui lòng nhập đầy đủ khoảng lương",
        });
      } else if (form.salaryMin > form.salaryMax) {
        context.addIssue({
          code: "custom",
          path: ["salaryMin"],
          message: "Mức lương tối thiểu không được lớn hơn mức lương tối đa",
        });
      }
    }

    if (form.salaryType === "FIXED" && form.salaryMin === undefined) {
      context.addIssue({
        code: "custom",
        path: ["salaryMin"],
        message: "Vui lòng nhập mức lương cố định",
      });
    }
  });

export type JobPostFormValues = z.infer<typeof jobPostFormSchema>;
