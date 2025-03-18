import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\d{10,15}$/, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^\d{10,15}$/, 'Invalid phone number').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});