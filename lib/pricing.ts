/* Server-side pricing authority.
   The browser is never trusted for amounts — given only each line's `key` and
   `qty`, we re-derive the price (and the human-readable name/variant/weight)
   from CONFIG, then compute the order total here.
   Imported by the API route handlers (Node runtime). */

import { CONFIG, type KatliWeight } from "./config";

export type OrderItemInput = { key: string; qty: number };

export type ParsedLine = {
  key: string;
  name: string;
  variant: string; // "—" when none
  weight: string;
  perKg: boolean;
  unit: number; // ₹ per pack or per kg
  qty: number; // packs, or total kg when perKg
  line: number; // ₹ line total
};

export type Amount = {
  paise: number; // total in paise (what Razorpay charges)
  rupees: number; // total in ₹
  subtotal: number;
  delivery: number;
  emg: number;
};

/** Resolve+validate a single cart line into its authoritative, fully-described form. */
export function parseLine(key: string, qtyInput: number): ParsedLine {
  const k = String(key);
  const qty = Math.floor(Number(qtyInput));

  // Regular Kaju Katli: katli-<varak 0|1>-<weight>
  const katli = k.match(/^katli-([01])-(250g|500g|1kg)$/);
  if (katli) {
    if (!Number.isInteger(qty) || qty < 1) throw new Error("Bad quantity for " + k);
    const v = Number(katli[1]);
    const w = katli[2] as KatliWeight;
    const unit = CONFIG.katli[w].price + (v ? CONFIG.katliVarakExtra : 0);
    return { key: k, name: "Kaju Katli", variant: v ? "With varak" : "Without varak", weight: w, perKg: false, unit, qty, line: unit * qty };
  }

  // Regular Kaju Pak (1kg only)
  if (k === "pak-1kg") {
    if (!Number.isInteger(qty) || qty < 1) throw new Error("Bad quantity for " + k);
    const unit = CONFIG.pak["1kg"].price;
    return { key: k, name: "Kaju Pak", variant: "—", weight: "1kg", perKg: false, unit, qty, line: unit * qty };
  }

  // Bulk: bulk-<katli|pak>-<varak 0|1>-<kg>; qty must equal the kg in the key
  const bulk = k.match(/^bulk-(katli|pak)-([01])-(\d+)$/);
  if (bulk) {
    const kg = Number(bulk[3]);
    if (kg < 10 || kg > 100 || kg % 10 !== 0) throw new Error("Bad bulk weight for " + k);
    if (qty !== kg) throw new Error("Quantity mismatch for " + k);
    const isK = bulk[1] === "katli";
    const v = Number(bulk[2]);
    const unit = isK ? CONFIG.bulkKatliPerKg : CONFIG.bulkPakPerKg;
    return {
      key: k,
      name: "Bulk " + (isK ? "Kaju Katli" : "Kaju Pak"),
      variant: isK ? (v ? "With varak" : "Without varak") : "—",
      weight: kg + "kg",
      perKg: true,
      unit,
      qty: kg,
      line: unit * kg,
    };
  }

  throw new Error("Unknown item: " + k);
}

/** Total an already-parsed set of lines plus delivery/emergency. */
export function totals(lines: ParsedLine[], area: "mumbai" | "other", emergency: boolean): Amount {
  const subtotal = lines.reduce((s, l) => s + l.line, 0);
  const delivery = area === "mumbai" ? CONFIG.deliveryMumbai : CONFIG.deliveryOutside;
  const emg = area === "mumbai" && emergency ? CONFIG.emergencyMumbai : 0;
  const rupees = subtotal + delivery + emg;
  if (rupees <= 0) throw new Error("Invalid amount");
  return { paise: Math.round(rupees * 100), rupees, subtotal, delivery, emg };
}

/** Parse a cart payload and compute its total in one step. */
export function priceCart(items: OrderItemInput[], area: "mumbai" | "other", emergency: boolean): { lines: ParsedLine[]; amount: Amount } {
  if (!Array.isArray(items) || items.length === 0) throw new Error("Empty cart");
  if (items.length > 50) throw new Error("Too many items");
  const lines = items.map((it) => parseLine(it.key, it.qty));
  return { lines, amount: totals(lines, area, emergency) };
}
