/* =====================================================================
   ⚙️  EDIT THIS FILE — confirm every value. All amounts in ₹.
   This is the single source of truth for prices, dates and contacts.
   ===================================================================== */

export type KatliWeight = "250g" | "500g" | "1kg";

export interface Config {
  DIWALI: string;
  DELIVER_BY: string;
  CUT_REGULAR_DAYS: number;
  CUT_BULK_DAYS: number;
  katli: Record<KatliWeight, { mrp: number; price: number }>;
  katliVarakExtra: number;
  pak: Record<"1kg", { mrp: number; price: number }>;
  bulkKatliPerKg: number;
  bulkPakPerKg: number;
  deliveryMumbai: number;
  deliveryOutside: number;
  emergencyMumbai: number;
  WHATSAPP: string;
  PHONE: string;
  INSTAGRAM: string;
  CAUSE_HTML: string;
}

export const CONFIG: Config = {
  DIWALI: "2026-11-08", // Lakshmi Puja 2026 (verified)
  DELIVER_BY: "6 Nov", // regular orders arrive ~2 days before Diwali
  CUT_REGULAR_DAYS: 7, // last regular order: 1 week before Diwali
  CUT_BULK_DAYS: 14, // bulk / corporate: 2 weeks before

  // Razorpay keys are NOT here — they are server-side env vars (see .env.example):
  //   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

  // Kaju Katli — same price with or without varak. mrp = struck "before" price.
  katli: { "250g": { mrp: 550, price: 400 }, "500g": { mrp: 1000, price: 700 }, "1kg": { mrp: 2000, price: 1400 } },
  katliVarakExtra: 0, // both finishes priced the same
  pak: { "1kg": { mrp: 2000, price: 1600 } }, // Kaju Pak, 1kg only

  bulkKatliPerKg: 1400, // per-kg rate for 10–100 kg
  bulkPakPerKg: 1600,

  deliveryMumbai: 0, // free in Mumbai
  deliveryOutside: 150, // ← PLACEHOLDER. Set once your delivery partner confirms rates.
  emergencyMumbai: 60, // Mumbai emergency (same/next-day) charge

  WHATSAPP: "919702246277", // primary contact (no +)
  PHONE: "+91 97022 46277", // primary contact
  INSTAGRAM: "https://instagram.com/", // ← your handle
  CAUSE_HTML: "[name your cause here — the seva you've supported for 8 years]", // ← edit
};

/* sample reviews — replace with real ones */
export const REVIEWS = [
  { n: "Meera Shah", c: "Mumbai", t: "Tastes exactly like home. The varak katli was gone in a day! Ordering again next year." },
  { n: "Rohan Patel", c: "Surat", t: "Reached two days before Diwali, perfectly packed. And it's for a good cause — couldn't ask for more." },
  { n: "Anjali Rao", c: "Pune", t: "We sent corporate boxes to 40 clients. Everyone asked where we got them. Fresh and beautiful." },
  { n: "Karthik N.", c: "Bengaluru", t: "Kaju Pak is dangerously good. Soft, rich, not too sweet. Worth every rupee." },
];

export const FAQ: [string, string][] = [
  ["When will my order arrive?", "Regular orders are delivered about 2 days before Diwali (6 Nov). Bulk and corporate orders arrive by the date you choose at checkout."],
  ["Do you deliver outside Mumbai?", "Yes, across India. Mumbai delivery is free; outside Mumbai a delivery charge applies, confirmed for your area. Please order early — there's no emergency option outside Mumbai."],
  ["Is there an emergency delivery?", "Only within Mumbai, for a small extra charge. Outside Mumbai we can't rush orders, so place them at least a week ahead."],
  ["When do orders close?", "Regular orders close about a week before Diwali; bulk and corporate close 2 weeks before, so we have time to pack and ship."],
  ["Where does the money go?", "100% of the profit goes to our seva — the same cause we've supported for 8 years. We keep nothing."],
];

export const STATES = [
  "Maharashtra", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman & Nicobar", "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu", "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

/* ---- derived dates & formatting helpers (deterministic except *_now) ---- */
export const diwali = new Date(CONFIG.DIWALI + "T00:00:00");
export const cutReg = (() => {
  const d = new Date(diwali);
  d.setDate(diwali.getDate() - CONFIG.CUT_REGULAR_DAYS);
  return d;
})();
export const cutBulk = (() => {
  const d = new Date(diwali);
  d.setDate(diwali.getDate() - CONFIG.CUT_BULK_DAYS);
  return d;
})();

export const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
export const daysLeft = (d: Date) => Math.ceil((d.getTime() - Date.now()) / 864e5);
export const rupee = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
export const ordersOpen = () => daysLeft(cutReg) > 0;
