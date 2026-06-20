import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  accountName: z
    .string()
    .min(2, "Account name must be at least 2 characters long"),
  industry: z.string().min(3, "Industry must be at least 3 characters long"),
  accountType: z.enum(["Influencer", "Brand"], {
    error: () => "Please select an account type",
  }),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(500, "Description must be 500 characters or less"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordStrength = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character",
  );

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordStrength,
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
