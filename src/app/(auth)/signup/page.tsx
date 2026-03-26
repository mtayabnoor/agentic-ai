"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validators";
import { Signup } from "@/lib/types";

export default function SignUpPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Signup>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: Signup) => {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
      },
      {
        onSuccess: () => {
          toast.success(
            "If this email can be used, we sent next steps to your inbox.",
          );
          router.push(
            `/verify-email?mode=pending&email=${encodeURIComponent(values.email)}`,
          );
        },
        onError: (ctx) => {
          setError("root", {
            message: ctx.error.message || "Registration failed",
          });
          toast.error(ctx.error.message || "Registration failed");
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Start managing your personal finances.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Global Error */}
            {errors.root && <FieldError errors={[errors.root]} />}

            <FieldGroup>
              {/* Name */}
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="signup-name">Name</FieldLabel>
                <Input
                  id="signup-name"
                  placeholder="John Doe"
                  {...register("name")}
                  autoComplete="off"
                />
                {errors.name && <FieldError errors={[errors.name]} />}
              </Field>

              {/* Email */}
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  autoComplete="off"
                />
                {errors.email && <FieldError errors={[errors.email]} />}
              </Field>

              {/* Password */}
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <Input
                  id="signup-password"
                  type="password"
                  {...register("password")}
                  autoComplete="off"
                />
                {errors.password && <FieldError errors={[errors.password]} />}
              </Field>

              {/* Confirm Password */}
              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="signup-confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  {...register("confirmPassword")}
                  autoComplete="off"
                />
                {errors.confirmPassword && (
                  <FieldError errors={[errors.confirmPassword]} />
                )}
              </Field>
            </FieldGroup>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between text-sm">
          <Link href="/signin" className="text-primary underline">
            Already have an account?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
