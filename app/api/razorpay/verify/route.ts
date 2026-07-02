import { NextResponse } from "next/server";
import crypto from "crypto";
import { confirmAndEmailInBackground } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VerifyBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

export async function POST(req: Request) {
  let body: VerifyBody;
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret || /x{4,}/i.test(keySecret)) {
    return NextResponse.json({ ok: false, error: "Payments not configured" }, { status: 500 });
  }
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ ok: false, error: "Missing payment fields" }, { status: 400 });
  }

  // Razorpay signs `${order_id}|${payment_id}` with HMAC-SHA256(key_secret).
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(String(razorpay_signature));
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!valid) {
    return NextResponse.json({ ok: false, error: "Signature verification failed" }, { status: 400 });
  }

  // Authentic → mark paid now, email in the background so the buyer's confirmation
  // screen doesn't wait on SMTP. The webhook is the backstop if the email fails.
  const result = await confirmAndEmailInBackground(razorpay_order_id, razorpay_payment_id);

  return NextResponse.json({ ok: true, paymentId: razorpay_payment_id, orderId: result.id });
}
