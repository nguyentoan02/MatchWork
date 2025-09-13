import z from "zod";

export const studentProfileSchema = z.object({
   name: z.string().min(1, "Vui lòng nhập tên"),
   email: z.string().email(),
   phone: z.string().regex(/^\d{10}$/, "số điện thoại cần có 10 số"),
   gender: z.enum(["MALE", "FEMALE", "OTHER"], "Vui lòng chọn giới tính"),
   address: z.object({
      city: z.string().min(1, "Vui lòng chọn thành phố"),
      street: z.string().min(1, "Vui lòng nhập địa chỉ"),
   }),
   avatar: z.any().optional(), // Avatar can be optional
   gradeLevel: z.string().min(1, "Vui lòng chọn lớp"),
   subjectsInterested: z
      .array(z.string())
      .min(1, "Vui lòng chọn ít nhất một môn học"),
   bio: z.string().min(50, "Vui lòng nhập giới thiệu bản thân 50 từ"),
   learningGoals: z.string().min(50, "Vui lòng nhập mục tiêu học tập 50 từ"),
   availability: z
      .array(
         z.object({
            dayOfWeek: z.number(),
            slots: z.array(z.string()),
         })
      )
      .min(1, "Vui lòng chọn ít nhất một lịch rảnh"),
});
