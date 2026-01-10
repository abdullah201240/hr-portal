import { z } from 'zod';

const urlRegex = /^(https?):\/\/[^\s/$.?#].[^\s]*$/i;

export const companyRegistrationSchema = z
  .object({
    name: z.string().min(1, 'Company name is required').max(255),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    address: z.string().min(1, 'Address is required'),
    phone: z
      .string()
      .optional()
      .transform((val) => (val === '' ? undefined : val))
      .refine(
        (val) => {
          if (!val) return true; // Allow undefined values
          return /^(\+\d{1,3})?\d{4,15}$/.test(val);
        },
        {
          message: 'Invalid phone number format',
        }
      ),
    website: z
      .string()
      .optional()
      .transform((val) => (val === '' ? undefined : val))
      .refine(
        (val) => {
          if (!val) return true; // Allow undefined values
          return urlRegex.test(val);
        },
        {
          message: 'Invalid website URL',
        }
      ),
    description: z
      .string()
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type CompanyRegistrationData = z.infer<typeof companyRegistrationSchema>;