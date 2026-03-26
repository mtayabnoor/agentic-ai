"use client";

import Link from "next/link";
import { Suspense, use, useEffect, useMemo, useState } from "react";
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

type VerifyStatus = "idle" | "success";

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const mode = params.get("mode");
  const emailFromQuery = params.get("email") || "";
  const [email, setEmail] = useState(emailFromQuery);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setEmail(emailFromQuery);
  }, [emailFromQuery]);

  useEffect(() => {
    if (mode === "success") {
      toast.success("Email verified successfully");
      router.push("/dashboard");
    }
  }, [mode]);

  const description = useMemo(() => {
    if (mode === "pending") {
      return "Check your inbox and click the verification link to activate your account.";
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
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      toast.error(payload?.message || "Could not send verification email.");
      return;
    }

    toast.success("Verification email sent. Please check your inbox.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Verify Email</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {( mode === "pending") && (
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
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend verification email"}
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between text-sm">
          <Link href="/signin" className="text-primary underline">
            Go to Sign In
          </Link>
          <Link href="/signup" className="text-primary underline">
            Create another account
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
