import { z } from 'zod';
import {
  signinSchema,
  signupSchema,
  resetPasswordSchema,
  newPasswordSchema,
  accountProfileSchema,
  accountEmailSchema,
  accountPasswordSchema,
} from './validators';

export type Signin = z.infer<typeof signinSchema>;

export type Signup = z.infer<typeof signupSchema>;

export type ResetPassword = z.infer<typeof resetPasswordSchema>;

export type NewPassword = z.infer<typeof newPasswordSchema>;

export type AccountProfile = z.infer<typeof accountProfileSchema>;

export type AccountEmail = z.infer<typeof accountEmailSchema>;

export type AccountPassword = z.infer<typeof accountPasswordSchema>;
