/*
- Use @prisma/adapter-neon only if your database is hosted on Neon.tech.
- Use @prisma/adapter-pg if you want a smaller bundle size in standard Node.js environments.
- For a standard Docker Postgres setup, simply instantiating a default new PrismaClient() is usually the easiest and most robust path.

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export { prisma };
*/

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const connectionString = process.env.DATABASE_URL || "";
const isNeon = connectionString.includes("neon.tech");

let adapter: PrismaNeon | PrismaPg;
if (isNeon) {
  console.log("Neon Postgres Adapter");
  neonConfig.webSocketConstructor = ws;
  adapter = new PrismaNeon({ connectionString });
} else {
  console.log("Traditional Postgres Adapter");
  adapter = new PrismaPg({ connectionString });
}
const prisma = new PrismaClient({ adapter });

export { prisma };
