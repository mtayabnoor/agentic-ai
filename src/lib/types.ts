import { z } from "zod";
import {
  signinSchema,
  signupSchema,
} from "./validators";

export type Signin = z.infer<typeof signinSchema>;

export type Signup = z.infer<typeof signupSchema>;
