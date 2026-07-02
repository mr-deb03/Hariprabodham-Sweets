import { getPrisma } from "./prisma";
import type { ParsedLine } from "./pricing";
import { sendOrderConfirmation } from "./email";

export type NewOrder = {
  id: string;
  status: "PENDING" | "PAID" | "DEMO" | "FAILED";
  razorpayOrderId?: string | null;
  paymentId?: string | null;
  signatureValid?: boolean;
  paymentMethod?: string | null;
  subtotal: number;
  delivery: number;
  emergency: number;
  total: number;
  area: string;
  deliverBy?: string | null;
  isBulk: boolean;
  name: string;
  phone: string;
  email: string;
  addressLine: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  notes?: string | null;
  lines: ParsedLine[];
};

/** Insert a new order (+ its items). No-op (logged) when the DB is not configured. */
export async function persistOrder(o: NewOrder) {
  const prisma = getPrisma();
  if (!prisma) {
    console.warn(`[orders] DATABASE_URL not set — not persisting order ${o.id}`);
    return null;
  }
  try {
    return await prisma.order.create({
      data: {
        id: o.id,
        status: o.status,
        razorpayOrderId: o.razorpayOrderId ?? null,
        paymentId: o.paymentId ?? null,
        signatureValid: o.signatureValid ?? false,
        paymentMethod: o.paymentMethod ?? null,
        subtotal: o.subtotal,
        delivery: o.delivery,
        emergency: o.emergency,
        total: o.total,
        area: o.area,
        deliverBy: o.deliverBy ?? null,
        isBulk: o.isBulk,
        name: o.name,
        phone: o.phone,
        email: o.email,
        addressLine: o.addressLine,
        landmark: o.landmark ?? null,
        city: o.city,
        state: o.state,
        pincode: o.pincode,
        notes: o.notes ?? null,
        items: {
          create: o.lines.map((l) => ({
            key: l.key,
            name: l.name,
            variant: l.variant,
            weight: l.weight,
            perKg: l.perKg,
            qty: l.qty,
            unit: l.unit,
            line: l.line,
          })),
        },
      },
      include: { items: true },
    });
  } catch (e) {
    console.error(`[orders] failed to persist order ${o.id}:`, e);
    return null;
  }
}

/** Flip a pending order to PAID after signature verification. Returns the order (with items) or null. */
export async function markOrderPaid(razorpayOrderId: string, paymentId: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    return await prisma.order.update({
      where: { razorpayOrderId },
      data: { status: "PAID", paymentId, signatureValid: true },
      include: { items: true },
    });
  } catch (e) {
    console.error(`[orders] failed to mark paid (${razorpayOrderId}):`, e);
    return null;
  }
}

export async function markEmailSent(id: string) {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    await prisma.order.update({ where: { id }, data: { emailSent: true } });
  } catch (e) {
    console.error(`[orders] failed to set emailSent (${id}):`, e);
  }
}

type PaidOrder = NonNullable<Awaited<ReturnType<typeof markOrderPaid>>>;

/* Send the confirmation email for an already-paid order — exactly once.
   Guards on emailSent so the verify route and the webhook backstop can't both
   send it. Returns true only if an email actually went out. */
async function emailConfirmationOnce(order: PaidOrder): Promise<boolean> {
  if (order.emailSent) return false;
  const mail = await sendOrderConfirmation({
    id: order.id,
    paymentId: order.paymentId,
    paymentMethod: order.paymentMethod,
    area: order.area,
    deliverBy: order.deliverBy,
    subtotal: order.subtotal,
    delivery: order.delivery,
    emergency: order.emergency,
    total: order.total,
    name: order.name,
    phone: order.phone,
    email: order.email,
    addressLine: order.addressLine,
    landmark: order.landmark,
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    notes: order.notes,
    lines: order.items.map((i) => ({
      name: i.name,
      variant: i.variant,
      weight: i.weight,
      perKg: i.perKg,
      qty: i.qty,
      line: i.line,
    })),
  });
  if (!mail.sent) return false;
  await markEmailSent(order.id);
  return true;
}

/* Mark an order paid and email its confirmation, awaiting both.
   Used by the webhook backstop, where no user is waiting on the response. */
export async function confirmAndEmail(
  razorpayOrderId: string,
  paymentId: string,
): Promise<{ id: string | null; paid: boolean; emailed: boolean }> {
  const order = await markOrderPaid(razorpayOrderId, paymentId);
  if (!order) return { id: null, paid: false, emailed: false };
  const emailed = await emailConfirmationOnce(order);
  return { id: order.id, paid: true, emailed };
}

/* Same, but for the buyer-facing verify route: mark paid (fast, awaited) and
   return right away, sending the email in the background so the customer's
   "payment confirmed" screen never blocks on SMTP. The webhook stays a backstop
   if the email fails here. The rejection is caught so it can't go unhandled. */
export async function confirmAndEmailInBackground(
  razorpayOrderId: string,
  paymentId: string,
): Promise<{ id: string | null; paid: boolean }> {
  const order = await markOrderPaid(razorpayOrderId, paymentId);
  if (!order) return { id: null, paid: false };
  void emailConfirmationOnce(order).catch((e) =>
    console.error(`[orders] background confirmation email failed for ${order.id}:`, e),
  );
  return { id: order.id, paid: true };
}
