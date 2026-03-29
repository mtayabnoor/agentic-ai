'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field';
import { newPasswordSchema } from '@/lib/validators';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authClient } from '@/lib/auth-client';
import { NewPassword } from '@/lib/types';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResetPasswordContent() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: NewPassword) => {
    await authClient.resetPassword(
      {
        newPassword: values.password,
        token,
      },
      {
        onSuccess: () => {
          toast.success('Password has been reset successfully.');
          router.push(`/signin`);
        },
      },
    );
  };

  return (
    <Suspense>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reset your password</CardTitle>
                <CardDescription>
                  Please set your new password below. Make sure it&apos;s strong and
                  secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="password">New Password</FieldLabel>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your new password"
                        {...register('password')}
                        required
                      />
                      {errors.password && <FieldError errors={[errors.password]} />}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                      <Input
                        id="confirm-password"
                        type="password"
                        {...register('confirmPassword')}
                        required
                      />
                      <FieldDescription>Please confirm your password.</FieldDescription>
                      {errors.confirmPassword && (
                        <FieldError errors={[errors.confirmPassword]} />
                      )}
                    </Field>
                    <Field>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                      </Button>
                      {errors.root && <FieldError errors={[errors.root]} />}
                      <FieldDescription className="text-center">
                        Don&apos;t have an account? <a href="/signup">Sign up</a>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
