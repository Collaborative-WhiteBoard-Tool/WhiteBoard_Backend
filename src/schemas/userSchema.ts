import z from "zod";

export const createUserSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters long!'),
  email: z.string().email("Invalid email!"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long!")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter!")
    .regex(/[a-z]/, "Password must contain at least one lowecase letter!")
    .regex(/[0-9]/, "Password must contain at least one number!")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character!"),
  confirmPassword: z.string().min(1, "Confirm password can not empty!"),
  displayName: z.string().optional(),
})
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Password do not match!",
        path: ["confirmPassword"]
      })
    }
  })
  .strict();

export const registerSchema = createUserSchema.omit({ confirmPassword: true }).strip()

export type CreateUserDTO = z.infer<typeof registerSchema>;
