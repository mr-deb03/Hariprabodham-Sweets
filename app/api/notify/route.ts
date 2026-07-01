import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    console.warn(`[notify] DATABASE_URL not set — would subscribe ${email}`);
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    // upsert so repeat sign-ups don't error
    await prisma.subscriber.upsert({
      where: { email },
      update: {},
      create: { email, source: "notify" },
    });
    return NextResponse.json({ ok: true, stored: true });
  } catch (e) {
    console.error("[notify] failed to save subscriber:", e);
    return NextResponse.json({ ok: false, error: "Could not save right now. Please try again." }, { status: 500 });
  }
}
