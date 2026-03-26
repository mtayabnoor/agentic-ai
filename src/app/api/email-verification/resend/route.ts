import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    return Response.json(
      { message: "Email is required." },
      { status: 400 },
    );
  }

  try {
    await auth.api.sendVerificationEmail({
      body: { email, callbackURL: "/email-verified" },
    });
    return Response.json({ status: "ok" }, { status: 200 });
  } catch {
    return Response.json(
      { message: "Could not send verification email." },
      { status: 400 },
    );
  }
}
