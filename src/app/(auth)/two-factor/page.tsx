'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { authClient } from '@/lib/auth-client';
import { twoFactorCodeSchema, twoFactorBackupCodeSchema } from '@/lib/validators';
import type { TwoFactorCode, TwoFactorBackupCode } from '@/lib/types';

export default function TwoFactorPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'totp' | 'backup'>('totp');

  const totpForm = useForm<TwoFactorCode>({
    resolver: zodResolver(twoFactorCodeSchema),
    defaultValues: { code: '' },
  });

  const backupForm = useForm<TwoFactorBackupCode>({
    resolver: zodResolver(twoFactorBackupCodeSchema),
    defaultValues: { code: '' },
  });

  const onVerifyTotp = async (values: TwoFactorCode) => {
    const { error } = await authClient.twoFactor.verifyTotp({ code: values.code });
    if (error) {
      totpForm.setError('code', { message: error.message ?? 'Invalid code. Please try again.' });
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  const onVerifyBackup = async (values: TwoFactorBackupCode) => {
    const { error } = await authClient.twoFactor.verifyBackupCode({ code: values.code });
    if (error) {
      backupForm.setError('code', { message: error.message ?? 'Invalid backup code.' });
      return;
    }
    toast.success('Signed in with backup code. Consider re-generating your backup codes.');
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Two-factor authentication</CardTitle>
            <CardDescription>
              {mode === 'totp'
                ? 'Enter the 6-digit code from your authenticator app.'
                : 'Enter one of your backup codes to access your account.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'totp' ? (
              <form onSubmit={totpForm.handleSubmit(onVerifyTotp)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Authentication code</FieldLabel>
                    <Controller
                      control={totpForm.control}
                      name="code"
                      render={({ field }) => (
                        <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                          <InputOTPGroup>
                            {Array.from({ length: 6 }).map((_, i) => (
                              <InputOTPSlot key={i} index={i} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      )}
                    />
                    {totpForm.formState.errors.code && (
                      <FieldError errors={[totpForm.formState.errors.code]} />
                    )}
                  </Field>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={totpForm.formState.isSubmitting}
                  >
                    {totpForm.formState.isSubmitting ? 'Verifying...' : 'Verify'}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setMode('backup')}
                  >
                    Use a backup code instead
                  </button>
                </FieldGroup>
              </form>
            ) : (
              <form onSubmit={backupForm.handleSubmit(onVerifyBackup)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Backup code</FieldLabel>
                    <Input placeholder="Enter backup code" {...backupForm.register('code')} />
                    {backupForm.formState.errors.code && (
                      <FieldError errors={[backupForm.formState.errors.code]} />
                    )}
                  </Field>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={backupForm.formState.isSubmitting}
                  >
                    {backupForm.formState.isSubmitting ? 'Verifying...' : 'Verify backup code'}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setMode('totp')}
                  >
                    Use authenticator app instead
                  </button>
                </FieldGroup>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
