"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}