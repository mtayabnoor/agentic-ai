import { z } from 'zod';
import {
  signinSchema,
  signupSchema,
  otpEmailSchema,
  otpVerifySchema,
  resetPasswordSchema,
  newPasswordSchema,
  accountProfileSchema,
  accountEmailSchema,
  accountPasswordSchema,
} from './validators';

export type Signin = z.infer<typeof signinSchema>;

export type OTPEmail = z.infer<typeof otpEmailSchema>;

export type OTPVerify = z.infer<typeof otpVerifySchema>;

export type Signup = z.infer<typeof signupSchema>;

export type ResetPassword = z.infer<typeof resetPasswordSchema>;

export type NewPassword = z.infer<typeof newPasswordSchema>;

export type AccountProfile = z.infer<typeof accountProfileSchema>;

export type AccountEmail = z.infer<typeof accountEmailSchema>;

export type AccountPassword = z.infer<typeof accountPasswordSchema>;
