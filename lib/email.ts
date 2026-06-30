import nodemailer from "nodemailer";
import { rupee } from "./config";

export type EmailLine = { name: string; variant: string; weight: string; perKg: boolean; qty: number; line: number };

export type EmailOrder = {
  id: string;
  paymentId?: string | null;
  paymentMethod?: string | null;
  area: string;
  deliverBy?: string | null;
  subtotal: number;
  delivery: number;
  emergency: number;
  total: number;
  name: string;
  phone: string;
  email: string;
  addressLine: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  notes?: string | null;
  lines: EmailLine[];
};

function transport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = (process.env.SMTP_SECURE ?? (port === 465 ? "true" : "false")) === "true";
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

function lineLabel(l: EmailLine) {
  const qty = l.perKg ? `${l.qty} kg` : `${l.qty} × ${l.weight}`;
  const variant = l.variant !== "—" ? ` (${l.variant})` : "";
  return `${l.name}${variant} — ${qty}`;
}

function buildText(o: EmailOrder) {
  const items = o.lines.map((l) => ` • ${lineLabel(l)} = ${rupee(l.line)}`).join("\n");
  return `Namaste ${o.name},

Your Hariprabodham Sweets order is confirmed — dhanyavaad!

ORDER ${o.id}
Payment: ${o.paymentId ?? "—"}${o.paymentMethod ? " (" + o.paymentMethod.toUpperCase() + ")" : ""}
${o.area === "mumbai" ? "Within Mumbai" : "Other state"} · Deliver by: ${o.deliverBy ?? "—"}

ITEMS
${items}

Subtotal: ${rupee(o.subtotal)}
Delivery: ${o.delivery ? rupee(o.delivery) : "Free"}${o.emergency ? "\nEmergency: " + rupee(o.emergency) : ""}
Total paid: ${rupee(o.total)}

DELIVER TO
${o.name} · ${o.phone}
${o.addressLine}${o.landmark ? ", " + o.landmark : ""}
${o.city}, ${o.state} - ${o.pincode}${o.notes ? "\nNotes: " + o.notes : ""}

Every rupee of profit goes to our seva. Thank you for being part of it.
— Hariprabodham Sweets`;
}

function buildHtml(o: EmailOrder) {
  const rows = o.lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 0;color:#241433">${lineLabel(l)}</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#241433">${rupee(
          l.line,
        )}</td></tr>`,
    )
    .join("");
  const sumRow = (label: string, val: string, strong = false) =>
    `<tr><td style="padding:3px 0;color:#7a6e57">${label}</td><td style="padding:3px 0;text-align:right;${
      strong ? "font-weight:800;font-size:17px;color:#241433" : "color:#241433"
    }">${val}</td></tr>`;
  return `<div style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#FFF6E9;border-radius:16px;overflow:hidden;border:1px solid #EBD9BC">
  <div style="background:#190826;padding:22px 24px">
    <div style="color:#FFC24B;font-weight:800;font-size:18px">Hariprabodham Sweets</div>
    <div style="color:#cbbcdd;font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin-top:3px">Diwali Seva · Mumbai</div>
  </div>
  <div style="padding:24px">
    <h2 style="margin:0 0 4px;color:#241433">Order confirmed — dhanyavaad 🪔</h2>
    <p style="margin:0 0 16px;color:#7a6e57">Namaste ${o.name}, your sweets are reserved. We'll pack and deliver in time.</p>
    <div style="background:#241433;color:#FFC24B;display:inline-block;padding:6px 14px;border-radius:9px;font-weight:800;letter-spacing:1px">${o.id}</div>
    <p style="margin:12px 0 0;color:#7a6e57;font-size:14px">Payment: ${o.paymentId ?? "—"}${
      o.paymentMethod ? " (" + o.paymentMethod.toUpperCase() + ")" : ""
    } · ${o.area === "mumbai" ? "Within Mumbai" : "Other state"} · Deliver by ${o.deliverBy ?? "—"}</p>

    <table style="width:100%;border-collapse:collapse;margin:18px 0 4px;border-top:1px solid #EBD9BC;border-bottom:1px solid #EBD9BC">${rows}</table>
    <table style="width:100%;border-collapse:collapse;margin-top:10px">
      ${sumRow("Subtotal", rupee(o.subtotal))}
      ${sumRow("Delivery", o.delivery ? rupee(o.delivery) : "Free")}
      ${o.emergency ? sumRow("Emergency", rupee(o.emergency)) : ""}
      ${sumRow("Total paid", rupee(o.total), true)}
    </table>

    <p style="margin:18px 0 4px;font-weight:700;color:#241433">Delivering to</p>
    <p style="margin:0;color:#7a6e57;font-size:14px;line-height:1.6">
      ${o.name} · ${o.phone}<br>
      ${o.addressLine}${o.landmark ? ", " + o.landmark : ""}<br>
      ${o.city}, ${o.state} - ${o.pincode}${o.notes ? "<br>Notes: " + o.notes : ""}
    </p>

    <p style="margin:20px 0 0;color:#7a6e57;font-size:13px">Every rupee of profit goes to our seva. Thank you for being part of it.</p>
  </div>
</div>`;
}

/** Send the order confirmation. Logs (no-op) when SMTP isn't configured. */
export async function sendOrderConfirmation(o: EmailOrder): Promise<{ sent: boolean; reason?: string }> {
  const t = transport();
  const subject = `Your Hariprabodham Sweets order ${o.id} is confirmed`;

  if (!t) {
    console.warn(`[email] SMTP not configured — would have emailed ${o.email} (order ${o.id}).`);
    return { sent: false, reason: "SMTP not configured" };
  }

  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: o.email,
      bcc: process.env.SHOP_EMAIL || undefined,
      subject,
      text: buildText(o),
      html: buildHtml(o),
    });
    return { sent: true };
  } catch (e) {
    console.error(`[email] failed to send confirmation for ${o.id}:`, e);
    return { sent: false, reason: e instanceof Error ? e.message : "send error" };
  }
}
