import { z } from "zod";
import {
  signinSchema,
  signupSchema,
  resetPasswordSchema,
  newPasswordSchema,
} from "./validators";

export type Signin = z.infer<typeof signinSchema>;

export type Signup = z.infer<typeof signupSchema>;

export type ResetPassword = z.infer<typeof resetPasswordSchema>;

export type NewPassword = z.infer<typeof newPasswordSchema>;
