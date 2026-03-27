"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function resendVerificationEmail(email: string) {
  if (!email) {
    return {
      success: false,
      message: "Email is required.",
    };
  }

  try {
    await auth.api.sendVerificationEmail({
      body: { email, callbackURL: "/verify-email" },
    });
    return {
      success: true,
      message: "If your account needs verification, an email is on the way.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Could not send verification email. Please try again later.",
    };
  }
}
