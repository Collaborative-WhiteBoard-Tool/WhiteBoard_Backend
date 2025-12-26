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
  displayName: z.string().optional(),
})
  .strict();

// export const registerSchema = createUserSchema.omit({ confirmPassword: true }).strip()

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required")
}).strict()


export type LoginDTO = z.infer<typeof loginSchema>
export type RegisterDTO = z.infer<typeof createUserSchema>;
