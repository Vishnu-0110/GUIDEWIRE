const { z } = require("zod");

const signupSchema = z.object({
  body: z
    .object({
      name: z.string().min(2),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      phone: z.string().min(10).optional(),
      city: z.string().min(2),
      zone: z.string().min(2).default("central").optional(),
      platform: z.enum(["Swiggy", "Zomato"]),
      dailyIncome: z.number().positive(),
      workingHours: z.number().positive()
    })
    .refine((value) => value.phone || (value.email && value.password), {
      message: "Provide phone OR email + password."
    })
    .refine((value) => ["Swiggy", "Zomato"].includes(value.platform), {
      message: "Persona scope is food delivery partners (Swiggy/Zomato)."
    })
});

const loginSchema = z.object({
  body: z
    .object({
      email: z.string().email().optional(),
      password: z.string().optional(),
      phone: z.string().optional(),
      otp: z.string().optional()
    })
    .refine((value) => value.phone || (value.email && value.password), {
      message: "Use phone+otp OR email+password."
    })
});

const otpRequestSchema = z.object({
  body: z.object({
    phone: z.string().min(10)
  })
});

const profileSchema = z.object({
  body: z.object({
    city: z.string().optional(),
    zone: z.string().optional(),
    platform: z.enum(["Swiggy", "Zomato"]).optional(),
    dailyIncome: z.number().positive().optional(),
    workingHours: z.number().positive().optional()
  })
});

const workStatusSchema = z.object({
  body: z.object({
    online: z.boolean(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    city: z.string().optional(),
    zone: z.string().optional(),
    deliveriesCompleted: z.number().min(0).optional()
  })
});

const buyPolicySchema = z.object({
  body: z.object({
    premium: z.number().refine((value) => [30, 50, 70].includes(value))
  })
});

module.exports = {
  signupSchema,
  loginSchema,
  otpRequestSchema,
  profileSchema,
  workStatusSchema,
  buyPolicySchema
};
