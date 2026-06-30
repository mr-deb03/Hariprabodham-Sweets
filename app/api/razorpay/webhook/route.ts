import { NextResponse } from "next/server";
import crypto from "crypto";
import { confirmAndEmail } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Razorpay webhook — a backstop for when the browser closes before the verify
   call fires. Configure the endpoint + a webhook secret in the Razorpay dashboard
   and set RAZORPAY_WEBHOOK_SECRET. Subscribe to `payment.captured` and `order.paid`.

   The signature is HMAC-SHA256 of the RAW request body with the webhook secret
   (a different secret from the API key secret), sent in `x-razorpay-signature`. */

type WebhookEvent = {
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string; method?: string } } };
};

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers.get("x-razorpay-signature");
  const raw = await req.text(); // raw bytes are required for the signature check

  // Not configured yet → acknowledge so Razorpay doesn't keep retrying.
  if (!secret || /x{4,}/i.test(secret)) {
    console.warn("[webhook] RAZORPAY_WEBHOOK_SECRET not set — ignoring event");
    return NextResponse.json({ ok: true, ignored: "not configured" });
  }
  if (!signature) {
    return NextResponse.json({ ok: false, error: "Missing signature" }, { status: 400 });
  }

  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(raw) as WebhookEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const type = event?.event;
  const payment = event?.payload?.payment?.entity;

  if ((type === "payment.captured" || type === "order.paid") && payment?.order_id && payment?.id) {
    const result = await confirmAndEmail(payment.order_id, payment.id);
    console.log(`[webhook] ${type} → order ${result.id ?? "unknown"} paid=${result.paid} emailed=${result.emailed}`);
  } else {
    console.log(`[webhook] ignored event: ${type ?? "unknown"}`);
  }

  // Always 200 so Razorpay marks the event delivered.
  return NextResponse.json({ ok: true });
}
