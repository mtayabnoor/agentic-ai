import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { after } from 'next/server';
import { prisma } from './db';
import {
  sendVerificationEmailWithResend,
  sendForgotPasswordEmailWithResend,
  sendChangeEmailConfirmationEmail,
  sendOTPEmailWithResend,
} from './email';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      allowedAttempts: 5,
      storeOTP: 'hashed',
      async sendVerificationOTP({ email, otp, type }) {
        after(
          sendOTPEmailWithResend({ email, otp, type }).catch((error) => {
            console.error('[auth] Failed to send OTP email to', email, error);
          }),
        );
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    onExistingUserSignUp: async () => {
      throw new Error('An account with this email already exists. Please sign in instead.');
    },
    sendResetPassword: async ({ user, url }) => {
      after(
        sendForgotPasswordEmailWithResend({
          email: user.email,
          name: user.name,
          resetUrl: url,
        }).catch((error) => {
          console.error('[auth] Failed to send password reset email to', user.email, error);
        }),
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      after(
        sendVerificationEmailWithResend({
          email: user.email,
          name: user.name,
          verifyUrl: url,
        }).catch((error) => {
          console.error('[auth] Failed to send verification email to', user.email, error);
        }),
      );
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
      /* sendChangeEmailConfirmation: async ({ user, newEmail, url, token }, request) => {
        void sendChangeEmailConfirmationEmail({
          email: user.email, // Sent to the CURRENT email
          name: user.name,
          newEmail,
          url,
        });
      },*/
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
