'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { RiRefreshLine } from '@remixicon/react';
import { useForm, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signinSchema, otpEmailSchema, otpVerifySchema } from '@/lib/validators';
import type { Signin, OTPEmail, OTPVerify } from '@/lib/types';

type SignInMode = 'password' | 'otp';
type OTPStep = 'email' | 'verify';

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<SignInMode>('password');
  const [otpStep, setOTPStep] = useState<OTPStep>('email');
  const [pendingEmail, setPendingEmail] = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [locked, setLocked] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // ─── Password form ───────────────────────────────────────────────────────────

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    setError: setPasswordError,
  } = useForm<Signin>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: '', password: '' },
  });

  const onPasswordSubmit = async (values: Signin) => {
    await authClient.signIn.email(
      { email: values.email, password: values.password },
      {
        onSuccess: () => {
          setLocked(true);
          toast.success('Logged in successfully');
          router.push('/dashboard');
        },
        onError: (ctx) => {
          setPasswordError('root', { message: ctx.error.message });
          toast.error(ctx.error.message);
        },
      },
    );
  };

  // ─── OTP email form ──────────────────────────────────────────────────────────

  const {
    register: registerOTPEmail,
    handleSubmit: handleOTPEmailSubmit,
    formState: { errors: otpEmailErrors },
    getValues: getOTPEmailValues,
  } = useForm<OTPEmail>({
    resolver: zodResolver(otpEmailSchema),
    defaultValues: { email: '' },
  });

  const sendOTP = async (email: string): Promise<string | null> => {
    setIsSendingOTP(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: 'sign-in',
    });
    setIsSendingOTP(false);

    if (error) {
      const msg = error.message ?? 'Failed to send code. Please try again.';
      toast.error(msg);
      return msg;
    }

    toast.success('A 6-digit code was sent to your email.');
    return null;
  };

  const onOTPEmailSubmit = async (values: OTPEmail) => {
    const error = await sendOTP(values.email);
    if (!error) {
      setPendingEmail(values.email);
      setOTPStep('verify');
    }
  };

  // ─── OTP verify form ─────────────────────────────────────────────────────────

  const {
    handleSubmit: handleOTPVerifySubmit,
    formState: { errors: otpVerifyErrors, isSubmitting: isOTPVerifying },
    setError: setOTPVerifyError,
    reset: resetOTPVerify,
    control: otpVerifyControl,
  } = useForm<OTPVerify>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { otp: '' },
  });

  const { field: otpField } = useController({
    name: 'otp',
    control: otpVerifyControl,
  });

  const onOTPVerifySubmit = async (values: OTPVerify) => {
    const { error } = await authClient.signIn.emailOtp({
      email: pendingEmail,
      otp: values.otp,
    });

    if (error) {
      setOTPVerifyError('otp', { message: error.message ?? 'Invalid or expired code.' });
      toast.error(error.message ?? 'Invalid or expired code.');
      return;
    }

    setLocked(true);
    toast.success('Logged in successfully');
    router.push('/dashboard');
  };

  const handleResendOTP = async () => {
    setResendError(null);
    const error = await sendOTP(pendingEmail);
    if (!error) {
      resetOTPVerify();
    } else {
      setResendError(error);
    }
  };

  const handleModeChange = (newMode: SignInMode) => {
    setMode(newMode);
    if (newMode === 'otp') {
      setOTPStep('email');
      setPendingEmail('');
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                {mode === 'password'
                  ? 'Enter your email and password to sign in'
                  : otpStep === 'email'
                    ? 'Enter your email to receive a sign-in code'
                    : `Enter the code sent to ${pendingEmail}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mode toggle */}
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => handleModeChange('password')}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    mode === 'password'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('otp')}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    mode === 'otp'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  OTP
                </button>
              </div>

              {/* Password sign-in */}
              {mode === 'password' && (
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="password-email">Email</FieldLabel>
                      <Input
                        id="password-email"
                        type="email"
                        placeholder="m@example.com"
                        autoComplete="email"
                        {...registerPassword('email')}
                        required
                      />
                      {passwordErrors.email && <FieldError errors={[passwordErrors.email]} />}
                    </Field>
                    <Field>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="password-password">Password</FieldLabel>
                        <a
                          href="/forgot-password"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <Input
                        id="password-password"
                        type="password"
                        autoComplete="current-password"
                        {...registerPassword('password')}
                        required
                      />
                      {passwordErrors.password && <FieldError errors={[passwordErrors.password]} />}
                    </Field>
                    <Field>
                      <Button type="submit" disabled={isPasswordSubmitting || locked}>
                        {isPasswordSubmitting ? 'Logging in...' : 'Login'}
                      </Button>
                      {passwordErrors.root && <FieldError errors={[passwordErrors.root]} />}
                      <FieldDescription className="text-center">
                        Don&apos;t have an account? <a href="/signup">Sign up</a>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </form>
              )}

              {/* OTP sign-in — email step */}
              {mode === 'otp' && otpStep === 'email' && (
                <form onSubmit={handleOTPEmailSubmit(onOTPEmailSubmit)}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="otp-email">Email</FieldLabel>
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder="m@example.com"
                        autoComplete="email"
                        {...registerOTPEmail('email')}
                        required
                      />
                      {otpEmailErrors.email && <FieldError errors={[otpEmailErrors.email]} />}
                    </Field>
                    <Field>
                      <Button type="submit" disabled={isSendingOTP}>
                        {isSendingOTP ? 'Sending code...' : 'Send Code'}
                      </Button>
                      <FieldDescription className="text-center">
                        Don&apos;t have an account? <a href="/signup">Sign up</a>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </form>
              )}

              {/* OTP sign-in — verify step */}
              {mode === 'otp' && otpStep === 'verify' && (
                <form onSubmit={handleOTPVerifySubmit(onOTPVerifySubmit)}>
                  <FieldGroup>
                    <Field>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="otp-verification">Verification code</FieldLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          disabled={isSendingOTP}
                          onClick={handleResendOTP}
                        >
                          <RiRefreshLine />
                          {isSendingOTP ? 'Sending...' : 'Resend Code'}
                        </Button>
                      </div>
                      {resendError && <FieldError errors={[{ message: resendError }]} />}
                      <div className="flex justify-center">
                        <InputOTP
                          id="otp-verification"
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS}
                          value={otpField.value}
                          onChange={otpField.onChange}
                          onBlur={otpField.onBlur}
                          autoFocus
                          required
                        >
                          <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                            <InputOTPSlot index={0} aria-invalid={!!otpVerifyErrors.otp} />
                            <InputOTPSlot index={1} aria-invalid={!!otpVerifyErrors.otp} />
                            <InputOTPSlot index={2} aria-invalid={!!otpVerifyErrors.otp} />
                            <InputOTPSlot index={3} aria-invalid={!!otpVerifyErrors.otp} />
                            <InputOTPSlot index={4} aria-invalid={!!otpVerifyErrors.otp} />
                            <InputOTPSlot index={5} aria-invalid={!!otpVerifyErrors.otp} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {otpVerifyErrors.otp && <FieldError errors={[otpVerifyErrors.otp]} />}
                      <FieldDescription>
                        <button
                          type="button"
                          onClick={() => setOTPStep('email')}
                          className="underline underline-offset-4 transition-colors hover:text-primary"
                        >
                          I want to use a different email address.
                        </button>
                      </FieldDescription>
                    </Field>
                    <Field>
                      <Button type="submit" disabled={isOTPVerifying || locked}>
                        {isOTPVerifying ? 'Verifying...' : 'Verify'}
                      </Button>
                      {otpVerifyErrors.root && <FieldError errors={[otpVerifyErrors.root]} />}
                      <div className="text-sm text-muted-foreground text-center">
                        Having trouble signing in?{' '}
                        <a
                          href="/forgot-password"
                          className="underline underline-offset-4 transition-colors hover:text-primary"
                        >
                          Reset your password
                        </a>
                      </div>
                    </Field>
                  </FieldGroup>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
