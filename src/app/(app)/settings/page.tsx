'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconLock,
  IconMail,
  IconRosetteDiscountCheck,
  IconUser,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { AccountEmail, AccountPassword, AccountProfile } from '@/lib/types';
import {
  accountEmailSchema,
  accountPasswordSchema,
  accountProfileSchema,
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

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col py-6">
        <p className="text-sm text-muted-foreground">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-3 py-3">
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Account
        </h1>
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
              <CardDescription>
                Keep your public account information up to date.
              </CardDescription>
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
              <CardDescription>
                Choose a strong password to keep your account protected.
              </CardDescription>
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
                      <FieldError
                        errors={[passwordForm.formState.errors.currentPassword]}
                      />
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register('newPassword')}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <FieldError errors={[passwordForm.formState.errors.newPassword]} />
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm new password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register('confirmPassword')}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <FieldError
                        errors={[passwordForm.formState.errors.confirmPassword]}
                      />
                    )}
                  </Field>

                  {passwordForm.formState.errors.root && (
                    <FieldError errors={[passwordForm.formState.errors.root]} />
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                      {passwordForm.formState.isSubmitting
                        ? 'Updating...'
                        : 'Change password'}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconRosetteDiscountCheck className="size-4" />
                Account overview
              </CardTitle>
              <CardDescription>
                Your current account details and verification status.
              </CardDescription>
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
