'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { resendVerificationEmail } from '@/lib/actions/email-verification';
import { authClient } from '@/lib/auth-client';
import type { ResendVerificationEmailFormValues } from '@/lib/types';
import { resendVerificationEmailSchema } from '@/lib/validators';

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const emailFromQuery = params.get('email') || '';

  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ResendVerificationEmailFormValues>({
    resolver: zodResolver(resendVerificationEmailSchema),
    defaultValues: {
      email: emailFromQuery,
    },
  });

  const { data: session } = authClient.useSession();
  const emailVerified = session?.user?.emailVerified;

  useEffect(() => {
    clearErrors();
    reset({ email: emailFromQuery });
  }, [clearErrors, emailFromQuery, reset]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const onResend = async (values: ResendVerificationEmailFormValues) => {
    const response = await resendVerificationEmail(values.email);

    if (!response.success) {
      setError('root', { message: response.message });
      toast.error(response.message);
      return;
    }

    setCooldown(60);
    toast.success('Verification email sent');
  };

  return (
    <div className="flex w-full items-center justify-center p-6 md:p-10">
      {emailVerified && (
        <Card className="w-full sm:max-w-md">
          <CardHeader>
            <CardTitle>Email Verified</CardTitle>
            <CardDescription>Your email has been verified successfully.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => router.push('/tools/dashboard')}>Go to Tools Dashboard</Button>
          </CardContent>
        </Card>
      )}
      {!emailVerified && (
        <Card className="w-full sm:max-w-md">
          <CardHeader>
            <CardTitle>Verify Email</CardTitle>
            <CardDescription>Use the email link you received to verify your account.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <Alert>
              <AlertDescription>
                Already verified before? Try signing in directly. If you forgot your password, reset it from
                sign in.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(onResend)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="verify-email-address">Email</FieldLabel>
                  <Input
                    id="verify-email-address"
                    type="email"
                    placeholder="name@example.com"
                    aria-invalid={errors.email ? true : undefined}
                    {...register('email')}
                  />
                  {errors.email && <FieldError errors={[errors.email]} />}
                </Field>
                {errors.root && <FieldError errors={[errors.root]} />}
                <Field>
                  <Button type="submit" className="w-full" disabled={isSubmitting || cooldown > 0}>
                    {isSubmitting
                      ? 'Sending...'
                      : cooldown > 0
                        ? `Resend available in ${cooldown}s`
                        : 'Resend verification email'}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between text-sm">
            <Link href="/signin" className="text-primary underline">
              Go to Sign In
            </Link>
            <Link href="/forgot-password" className="text-primary underline">
              Forgot password?
            </Link>
            <Link href="/signup" className="text-primary underline">
              Use another email
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
