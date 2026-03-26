import { z } from "zod";
import {
  signinSchema,
  signupSchema,
  transactionFormSchema,
  subscriptionFormSchema,
} from "./validators";

export type Signin = z.infer<typeof signinSchema>;

export type Signup = z.infer<typeof signupSchema>;

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;
