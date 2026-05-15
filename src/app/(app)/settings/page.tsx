'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconLock, IconMail, IconRosetteDiscountCheck, IconUser } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RiShieldCheckLine } from '@remixicon/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { authClient } from '@/lib/auth-client';
import {
  AccountEmail,
  AccountPassword,
  AccountProfile,
  TwoFactorCode,
  TwoFactorPassword,
} from '@/lib/types';
import {
  accountEmailSchema,
  accountPasswordSchema,
  accountProfileSchema,
  twoFactorCodeSchema,
  twoFactorPasswordSchema,
} from '@/lib/validators';

export default function AccountPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const profileForm = useForm<AccountProfile>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const emailForm = useForm<AccountEmail>({
    resolver: zodResolver(accountEmailSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<AccountPassword>({
    resolver: zodResolver(accountPasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  type TwoFaStep = 'idle' | 'enable-password' | 'scan-qr' | 'backup-codes' | 'disable-password';
  const [twoFaStep, setTwoFaStep] = useState<TwoFaStep>('idle');
  const [totpUri, setTotpUri] = useState('');
  const [savedBackupCodes, setSavedBackupCodes] = useState<string[]>([]);

  const twoFaPasswordForm = useForm<TwoFactorPassword>({
    resolver: zodResolver(twoFactorPasswordSchema),
    defaultValues: { password: '' },
  });

  const twoFaCodeForm = useForm<TwoFactorCode>({
    resolver: zodResolver(twoFactorCodeSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    if (!user) {
      router.push('/signin?callbackUrl=/settings');
    }
  }, [user, router]);

  const onUpdateProfile = async (values: AccountProfile) => {
    const { error } = await authClient.updateUser(
      {
        name: values.name.trim(),
      },
      {
        onSuccess: async () => {
          router.refresh();
        },
      },
    );

    if (error) {
      profileForm.setError('root', {
        message: error.message,
      });
      toast.error(error.message);
      return;
    }

    toast.success('Your profile has been updated');
    router.refresh();
  };

  const onChangeEmail = async (values: AccountEmail) => {
    const newEmail = values.email.trim();

    if (newEmail === user?.email) {
      emailForm.setError('root', {
        message: 'Please enter a different email address.',
      });
      return;
    }

    const { error } = await authClient.changeEmail(
      {
        newEmail: newEmail,
        callbackURL: '/settings',
      },
      {
        onSuccess: async () => {
          router.refresh();
          router.push('/signin');
        },
      },
    );

    if (error) {
      emailForm.setError('root', {
        message: error.message,
      });
      toast.error(error.message);
      return;
    }

    toast.success('Check your new email to verify the change');
  };

  const onChangePassword = async (values: AccountPassword) => {
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      passwordForm.setError('root', {
        message: error.message,
      });
      toast.error(error.message);
      return;
    }

    passwordForm.reset({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    toast.success('Your password has been updated');
    router.refresh();
  };

  const onEnableStart = async (values: TwoFactorPassword) => {
    const { data, error } = await authClient.twoFactor.enable({ password: values.password });
    if (error || !data) {
      const msg = 'Incorrect password. Please try again.';
      twoFaPasswordForm.setError('password', { message: msg });
      toast.error(msg);
      return;
    }
    setTotpUri(data.totpURI);
    setSavedBackupCodes(data.backupCodes);
    twoFaPasswordForm.reset();
    setTwoFaStep('scan-qr');
  };

  const onEnableVerify = async (values: TwoFactorCode) => {
    const { error } = await authClient.twoFactor.verifyTotp({ code: values.code });
    if (error) {
      twoFaCodeForm.setError('code', { message: error.message ?? 'Invalid code.' });
      return;
    }
    twoFaCodeForm.reset();
    setTwoFaStep('backup-codes');
  };

  const onDisable = async (values: TwoFactorPassword) => {
    const { error } = await authClient.twoFactor.disable({ password: values.password });
    if (error) {
      const msg = 'Incorrect password. Please try again.';
      twoFaPasswordForm.setError('password', { message: msg });
      toast.error(msg);
      return;
    }
    toast.success('Two-factor authentication has been disabled.');
    twoFaPasswordForm.reset();
    setTwoFaStep('idle');
    router.refresh();
  };

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col py-6">
        <p className="text-sm text-muted-foreground">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 min-h-0 flex-col gap-3 py-3 overflow-y-auto">
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Account</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Update your personal details and keep your sign-in credentials secure.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="size-4" />
                Profile
              </CardTitle>
              <CardDescription>Keep your public account information up to date.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onUpdateProfile)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Full name</FieldLabel>
                    <Input id="name" {...profileForm.register('name')} />
                    {profileForm.formState.errors.name && (
                      <FieldError errors={[profileForm.formState.errors.name]} />
                    )}
                  </Field>
                  {profileForm.formState.errors.root && (
                    <FieldError errors={[profileForm.formState.errors.root]} />
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                      {profileForm.formState.isSubmitting ? 'Saving...' : 'Save changes'}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconMail className="size-4" />
                Email address
              </CardTitle>
              <CardDescription>
                Changing your email requires verification before the update is applied.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={emailForm.handleSubmit(onChangeEmail)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" type="email" {...emailForm.register('email')} />
                    <FieldDescription>
                      We will send a verification link to your new email address.
                    </FieldDescription>
                    {emailForm.formState.errors.email && (
                      <FieldError errors={[emailForm.formState.errors.email]} />
                    )}
                  </Field>
                  {emailForm.formState.errors.root && (
                    <FieldError errors={[emailForm.formState.errors.root]} />
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={emailForm.formState.isSubmitting}>
                      {emailForm.formState.isSubmitting ? 'Sending...' : 'Update email'}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconLock className="size-4" />
                Password
              </CardTitle>
              <CardDescription>Choose a strong password to keep your account protected.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordForm.register('currentPassword')}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <FieldError errors={[passwordForm.formState.errors.currentPassword]} />
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                    <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                    {passwordForm.formState.errors.newPassword && (
                      <FieldError errors={[passwordForm.formState.errors.newPassword]} />
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register('confirmPassword')}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <FieldError errors={[passwordForm.formState.errors.confirmPassword]} />
                    )}
                  </Field>

                  {passwordForm.formState.errors.root && (
                    <FieldError errors={[passwordForm.formState.errors.root]} />
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                      {passwordForm.formState.isSubmitting ? 'Updating...' : 'Change password'}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiShieldCheckLine className="size-4" />
                Two-factor authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security using an authenticator app like Google Authenticator
                or Authy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {twoFaStep === 'idle' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication is currently{' '}
                    <span className="font-medium text-foreground">
                      {user.twoFactorEnabled ? 'enabled' : 'disabled'}
                    </span>
                    .
                  </p>
                  {user.twoFactorEnabled ? (
                    <Button variant="outline" onClick={() => setTwoFaStep('disable-password')}>
                      Disable two-factor authentication
                    </Button>
                  ) : (
                    <Button onClick={() => setTwoFaStep('enable-password')}>
                      Enable 2FA
                    </Button>
                  )}
                </div>
              )}

              {(twoFaStep === 'enable-password' || twoFaStep === 'disable-password') && (
                <form
                  onSubmit={twoFaPasswordForm.handleSubmit(
                    twoFaStep === 'enable-password' ? onEnableStart : onDisable,
                  )}
                >
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="2fa-password">Account password</FieldLabel>
                      <Input
                        id="2fa-password"
                        type="password"
                        autoComplete="current-password"
                        {...twoFaPasswordForm.register('password')}
                      />
                      <FieldDescription>
                        Enter your account password. If you signed up using email OTP only, leave
                        this empty.
                      </FieldDescription>
                      {twoFaPasswordForm.formState.errors.password && (
                        <FieldError errors={[twoFaPasswordForm.formState.errors.password]} />
                      )}
                    </Field>
                    {twoFaPasswordForm.formState.errors.root && (
                      <FieldError errors={[twoFaPasswordForm.formState.errors.root]} />
                    )}
                    <div className="flex gap-2">
                      <Button type="submit" disabled={twoFaPasswordForm.formState.isSubmitting}>
                        {twoFaPasswordForm.formState.isSubmitting ? 'Confirming...' : 'Confirm'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          twoFaPasswordForm.reset();
                          setTwoFaStep('idle');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </FieldGroup>
                </form>
              )}

              {twoFaStep === 'scan-qr' && (
                <form onSubmit={twoFaCodeForm.handleSubmit(onEnableVerify)}>
                  <FieldGroup>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Scan this QR code with your authenticator app, then enter the 6-digit code
                        to confirm.
                      </p>
                      <div className="flex justify-center rounded-lg bg-white p-3">
                        <QRCode value={totpUri} size={160} />
                      </div>
                    </div>
                    <Field>
                      <FieldLabel>Authentication code</FieldLabel>
                      <Controller
                        control={twoFaCodeForm.control}
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
                      {twoFaCodeForm.formState.errors.code && (
                        <FieldError errors={[twoFaCodeForm.formState.errors.code]} />
                      )}
                    </Field>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={twoFaCodeForm.formState.isSubmitting}>
                        {twoFaCodeForm.formState.isSubmitting ? 'Verifying...' : 'Verify and enable'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          twoFaCodeForm.reset();
                          setTwoFaStep('idle');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </FieldGroup>
                </form>
              )}

              {twoFaStep === 'backup-codes' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    2FA is now enabled. Save these backup codes somewhere safe — each can only be
                    used once.
                  </p>
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-3 font-mono text-sm">
                    {savedBackupCodes.map((code, i) => (
                      <div key={i} className="text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(savedBackupCodes.join('\n'));
                        toast.success('Backup codes copied to clipboard.');
                      }}
                    >
                      Copy all
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setTwoFaStep('idle');
                        router.refresh();
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 pl-3 pr-3 xl:border-l">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconRosetteDiscountCheck className="size-4" />
                Account overview
              </CardTitle>
              <CardDescription>Your current account details and verification status.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4 text-sm">
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium text-foreground">{user.name}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="break-all font-medium text-foreground">{user.email}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Verification</dt>
                  <dd className="font-medium text-foreground">
                    {user.emailVerified ? 'Verified' : 'Pending verification'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
