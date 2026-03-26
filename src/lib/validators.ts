import { z } from "zod";

// ─── Auth ───────────────────────────────────────

export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ─── Transaction ────────────────────────────────

// Server-side schema (used in actions.ts – z.coerce handles serialization)
export const transactionSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce.number(),
  category: z.string().min(1, "Category is required"),
  date: z.coerce.date(),
  note: z.string().optional(),
});

// Client-side form schema (no z.coerce – compatible with zodResolver)
export const transactionFormSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

// ─── Subscription ───────────────────────────────

// Server-side schema
export const subscriptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  billingCycle: z.enum(["monthly", "yearly", "weekly"]),
  nextBillingDate: z.coerce.date(),
});

// Client-side form schema
export const subscriptionFormSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  amount: z.number().positive("Amount must be positive"),
  billingCycle: z.enum(["monthly", "yearly", "weekly"]),
  nextBillingDate: z.string().min(1, "Billing date is required"),
});
