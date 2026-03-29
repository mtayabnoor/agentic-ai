import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { sendVerificationEmailWithResend, sendForgotPasswordEmailWithResend } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    onExistingUserSignUp: async () => {
      throw new Error("An account with this email already exists. Please sign in instead.");
    },
    sendResetPassword: async ({user, url, token}, request) => {
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
      const verifyUrl = new URL(url);
      verifyUrl.searchParams.set("callbackURL", "/verify-email?mode=success");
      void sendVerificationEmailWithResend({
        email: user.email,
        name: user.name,
        verifyUrl: verifyUrl.toString(),
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
