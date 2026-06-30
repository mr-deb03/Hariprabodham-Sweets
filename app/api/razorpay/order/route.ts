import { NextResponse } from "next/server";
import crypto from "crypto";
import { priceCart, type OrderItemInput } from "@/lib/pricing";
import { persistOrder, markEmailSent, type NewOrder } from "@/lib/orders";
import { sendOrderConfirmation, type EmailOrder } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const looksPlaceholder = (s?: string) => !s || s.trim() === "" || /x{4,}/i.test(s);

type OrderBody = {
  items?: OrderItemInput[];
  area?: "mumbai" | "other";
  emergency?: boolean;
  payMethod?: string;
  deliverBy?: string;
  name?: string;
  phone?: string;
  email?: string;
  addr1?: string;
  land?: string;
  city?: string;
  state?: string;
  pin?: string;
  notes?: string;
};

const str = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  let body: OrderBody;
  try {
    body = (await req.json()) as OrderBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const items: OrderItemInput[] = Array.isArray(body?.items) ? body.items : [];
  const area: "mumbai" | "other" = body?.area === "other" ? "other" : "mumbai";
  const emergency = !!body?.emergency;

  // Authoritative amount + line details — recomputed from trusted prices.
  let priced;
  try {
    priced = priceCart(items, area, emergency);
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Pricing error" }, { status: 400 });
  }
  const { lines, amount } = priced;
  const isBulk = lines.some((l) => l.perKg);

  const id = "HPS-" + new Date().getFullYear() + "-" + crypto.randomBytes(4).toString("hex").slice(0, 5).toUpperCase();

  // shared customer/amount fields for the DB record
  const base: Omit<NewOrder, "status" | "razorpayOrderId" | "paymentId" | "signatureValid"> = {
    id,
    paymentMethod: str(body?.payMethod, 20) || null,
    subtotal: amount.subtotal,
    delivery: amount.delivery,
    emergency: amount.emg,
    total: amount.rupees,
    area,
    deliverBy: str(body?.deliverBy, 40) || null,
    isBulk,
    name: str(body?.name, 80),
    phone: str(body?.phone, 20),
    email: str(body?.email, 120),
    addressLine: str(body?.addr1, 200),
    landmark: str(body?.land, 120) || null,
    city: str(body?.city, 80),
    state: str(body?.state, 60),
    pincode: str(body?.pin, 10),
    notes: str(body?.notes, 400) || null,
    lines,
  };

  const emailPayload: EmailOrder = {
    id,
    paymentMethod: base.paymentMethod,
    area,
    deliverBy: base.deliverBy,
    subtotal: base.subtotal,
    delivery: base.delivery,
    emergency: base.emergency,
    total: base.total,
    name: base.name,
    phone: base.phone,
    email: base.email,
    addressLine: base.addressLine,
    landmark: base.landmark,
    city: base.city,
    state: base.state,
    pincode: base.pincode,
    notes: base.notes,
    lines,
  };

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // ── Demo mode: no real credentials. Persist + email immediately, no charge. ──
  if (looksPlaceholder(keyId) || looksPlaceholder(keySecret)) {
    const paymentId = "DEMO-" + crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
    await persistOrder({ ...base, status: "DEMO", paymentId, signatureValid: false, razorpayOrderId: null });
    const mail = await sendOrderConfirmation({ ...emailPayload, paymentId });
    if (mail.sent) await markEmailSent(id);
    return NextResponse.json({ ok: true, demo: true, orderId: id, paymentId, emailSent: mail.sent });
  }

  // ── Live mode: create the Razorpay order, then persist as PENDING. ──
  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: amount.paise,
        currency: "INR",
        receipt: id,
        notes: { orderId: id, name: base.name, phone: base.phone, area },
      }),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: data?.error?.description ?? "Razorpay order creation failed" },
        { status: 502 },
      );
    }

    await persistOrder({ ...base, status: "PENDING", razorpayOrderId: data.id, paymentId: null, signatureValid: false });

    return NextResponse.json({
      ok: true,
      demo: false,
      orderId: id,
      razorpayOrderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId, // public key id — safe to send to the browser
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not reach the payment gateway" }, { status: 502 });
  }
}
