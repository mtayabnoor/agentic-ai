import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './db';
import {
  sendVerificationEmailWithResend,
  sendForgotPasswordEmailWithResend,
  sendChangeEmailConfirmationEmail,
} from './email';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    onExistingUserSignUp: async () => {
      throw new Error(
        'An account with this email already exists. Please sign in instead.',
      );
    },
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendForgotPasswordEmailWithResend({
        email: user.email,
        name: user.name,
        resetUrl: url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      void sendVerificationEmailWithResend({
        email: user.email,
        name: user.name,
        verifyUrl: url,
      });
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
