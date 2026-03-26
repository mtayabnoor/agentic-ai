"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const mode = params.get("mode");
  const emailFromQuery = params.get("email") || "";
  const [email, setEmail] = useState(emailFromQuery);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setEmail(emailFromQuery);
  }, [emailFromQuery]);

  useEffect(() => {
    if (mode === "success") {
      toast.success("Email verified successfully");
      router.push("/dashboard");
    }
  }, [mode, router]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const description = useMemo(() => {
    if (mode === "pending") {
      return "If this email can be used, we sent instructions to verify it.";
    }

    return "Use the email link you received to verify your account.";
  }, [mode]);

  const onResend = async () => {
    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }

    setResending(true);

    const response = await fetch("/api/email-verification/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setResending(false);

    if (!response.ok) {
      toast.error("Could not process your request right now. Please try again.");
      return;
    }

    setCooldown(60);
    toast.success("If your account needs verification, an email is on the way.");
  };
  if (mode === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full sm:max-w-md">
          <CardHeader>
            <CardTitle>Email Verified</CardTitle>
            <CardDescription>
              Your email has been verified successfully.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Verify Email</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            Already verified before? Try signing in directly. If you forgot your password, reset it from sign in.
          </div>

          {mode === "pending" && (
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button
                type="button"
                className="w-full"
                onClick={onResend}
                disabled={resending || cooldown > 0}
              >
                {resending
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend available in ${cooldown}s`
                    : "Resend verification email"}
              </Button>
            </div>
          )}
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
