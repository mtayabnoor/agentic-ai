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
import { signinSchema } from "@/lib/validators";
import { Signin } from "@/lib/types";

export default function SignInPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Signin>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: Signin) => {
    await authClient.signIn.email(
      { email: values.email, password: values.password },
      {
        onSuccess: () => {
          toast.success("Logged in successfully");
          router.push("/dashboard");
        },
        onError: (ctx) => {
          const errorMessage = ctx.error.message || "Signin failed";
          const requiresVerification = /email_not_verified|verify/i.test(errorMessage);

          if (requiresVerification) {
            toast.error("Please verify your email before signing in.");
            router.push(`/verify-email?mode=pending&email=${encodeURIComponent(values.email)}`);
            return;
          }

          setError("root", {
            message: errorMessage || "Invalid email or password",
          });
          toast.error(errorMessage || "Signin failed");
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to sign in.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Global Error */}
            {errors.root && (
              <FieldError errors={[errors.root]} />
            )}

            <FieldGroup>
              {/* Email */}
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="signin-email">Email</FieldLabel>
                <Input
                  id="signin-email"
                  type="email"
                  {...register("email")}
                  autoComplete="off"
                />
                {errors.email && (
                  <FieldError errors={[errors.email]} />
                )}
              </Field>

              {/* Password */}
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="signin-password">Password</FieldLabel>
                <Input
                  id="signin-password"
                  type="password"
                  {...register("password")}
                  autoComplete="off"
                />
                {errors.password && (
                  <FieldError errors={[errors.password]} />
                )}
              </Field>
            </FieldGroup>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between text-sm">
          <Link href="/signup" className="text-primary underline">
            Create account
          </Link>
          <Link href="/forgot-password" className="text-primary underline">
            Forgot password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
