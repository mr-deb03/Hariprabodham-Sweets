"use client";

import { useEffect, useRef, useState } from "react";
import { useCart, type CartItem } from "@/lib/cart-context";
import { CONFIG, STATES, rupee, diwali } from "@/lib/config";

type Step = "stepCart" | "stepDetails" | "stepPay" | "stepDone";
type Area = "mumbai" | "other";
type Pay = "upi" | "card" | "netbanking";

const TITLES: Record<Step, string> = {
  stepCart: "Your order",
  stepDetails: "Delivery details",
  stepPay: "Payment",
  stepDone: "Confirmed",
};

const BLANK = {
  name: "",
  phone: "",
  email: "",
  date: "",
  addr1: "",
  land: "",
  city: "",
  pin: "",
  state: "Maharashtra",
  notes: "",
};
type Form = typeof BLANK;
type Errors = Partial<Record<keyof Form, boolean>>;

type Order = {
  id: string;
  payId: string;
  area: Area;
  payMethod: Pay;
  subtotal: number;
  delivery: number;
  emg: number;
  total: number;
  deliverBy: string;
  items: (CartItem & { line: number })[];
  name: string;
  phone: string;
  email: string;
  addr: string;
  city: string;
  pin: string;
  state: string;
  notes: string;
};

const PAY_OPTIONS: [Pay, string, string][] = [
  ["upi", "UPI", "GPay, PhonePe, Paytm"],
  ["card", "Card", "Debit / Credit"],
  ["netbanking", "Net banking", "All major banks"],
];

export default function CartDrawer() {
  const { cart, remove, clear, subtotal, isOpen, closeCart, ordersOpen } = useCart();

  const [step, setStep] = useState<Step>("stepCart");
  const [area, setAreaState] = useState<Area>("mumbai");
  const [emg, setEmg] = useState(false);
  const [pay, setPay] = useState<Pay>("upi");
  const [form, setForm] = useState<Form>(BLANK);
  const [errors, setErrors] = useState<Errors>({});
  const [order, setOrder] = useState<Order | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const drawerRef = useRef<HTMLElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const isBulk = cart.some((i) => i.perKg);
  const deliveryFee = area === "mumbai" ? CONFIG.deliveryMumbai : CONFIG.deliveryOutside;
  const emgFee = area === "mumbai" && emg ? CONFIG.emergencyMumbai : 0;
  const grand = subtotal + deliveryFee + emgFee;

  // remember the trigger element; restore focus to it on close
  useEffect(() => {
    if (isOpen) lastFocused.current = document.activeElement as HTMLElement;
    else lastFocused.current?.focus?.();
  }, [isOpen]);

  // move focus into the active step when opening or changing steps
  useEffect(() => {
    if (!isOpen) return;
    const d = drawerRef.current;
    if (!d) return;
    const target =
      d.querySelector<HTMLElement>(".step.on input:not([readonly]), .step.on select, .step.on .cta-full:not(:disabled)") ||
      d.querySelector<HTMLElement>(".closeb");
    const id = requestAnimationFrame(() => target?.focus());
    return () => cancelAnimationFrame(id);
  }, [isOpen, step]);

  // ESC to close + trap Tab inside the drawer
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
        return;
      }
      if (e.key === "Tab") {
        const d = drawerRef.current;
        if (!d) return;
        const f = Array.from(
          d.querySelectorAll<HTMLElement>('button,input,select,textarea,a[href],[tabindex="0"]'),
        ).filter((x) => x.offsetParent !== null && !(x as HTMLButtonElement).disabled);
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  const setField = (k: keyof Form, val: string) => setForm((f) => ({ ...f, [k]: val }));
  const digits = (s: string) => s.replace(/\D/g, "");

  const setArea = (a: Area) => {
    setAreaState(a);
    if (a !== "mumbai") setEmg(false);
    if (a === "mumbai") setField("state", "Maharashtra");
  };

  const onChipKey = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  const goDetails = () => {
    if (isBulk && !form.date) {
      const d = new Date(diwali);
      d.setDate(d.getDate() - 2);
      setField("date", d.toISOString().slice(0, 10));
    }
    setArea(area);
    setStep("stepDetails");
  };

  const validate = () => {
    const e: Errors = {};
    e.name = !(form.name.trim().length >= 2);
    e.phone = !/^[6-9]\d{9}$/.test(form.phone.trim());
    e.email = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    e.addr1 = !(form.addr1.trim().length >= 4);
    e.city = !(form.city.trim().length >= 2);
    e.pin = !/^\d{6}$/.test(form.pin.trim());
    e.state = !form.state;
    if (isBulk) e.date = !form.date;
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const goPay = () => {
    if (!validate()) return;
    setPayError(null);
    setStep("stepPay");
  };

  const finishOrder = (id: string, payId: string) => {
    const items = cart.map((it) => ({ ...it, line: it.unit * it.qty }));
    setOrder({
      id,
      payId,
      area,
      payMethod: pay,
      subtotal,
      delivery: deliveryFee,
      emg: emgFee,
      total: grand,
      deliverBy: isBulk ? form.date : CONFIG.DELIVER_BY,
      items,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      addr: [form.addr1.trim(), form.land.trim()].filter(Boolean).join(", "),
      city: form.city.trim(),
      pin: form.pin.trim(),
      state: form.state,
      notes: form.notes.trim(),
    });
    setPaying(false);
    setStep("stepDone");
  };

  const payNow = async () => {
    setPaying(true);
    setPayError(null);
    try {
      // 1. Backend creates the order and re-computes the amount from trusted prices.
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((it) => ({ key: it.key, qty: it.qty })),
          area,
          emergency: emg,
          payMethod: pay,
          deliverBy: isBulk ? form.date : CONFIG.DELIVER_BY,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          addr1: form.addr1.trim(),
          land: form.land.trim(),
          city: form.city.trim(),
          state: form.state,
          pin: form.pin.trim(),
          notes: form.notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || "Could not start payment. Please try again.");

      // 2a. No real keys configured yet → simulate (demo mode). Order is already
      // persisted + emailed server-side; just show the confirmation.
      if (data.demo) {
        finishOrder(data.orderId, data.paymentId);
        return;
      }

      // 2b. Open Razorpay checkout against the server-created order.
      if (typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Payment library hasn't loaded yet — please retry in a moment.");
      }
      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Hariprabodham Sweets",
        description: "Diwali order",
        prefill: { name: form.name.trim(), email: form.email.trim(), contact: form.phone.trim() },
        theme: { color: "#E89A22" },
        // 3. Verify the signature server-side before confirming.
        handler: async (r: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            const v = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(r),
            });
            const vd = await v.json();
            if (v.ok && vd.ok) {
              finishOrder(vd.orderId || data.orderId, vd.paymentId);
            } else {
              setPaying(false);
              setPayError(
                "We couldn't verify the payment. If money was deducted, contact us with payment id " +
                  r.razorpay_payment_id +
                  ".",
              );
            }
          } catch {
            setPaying(false);
            setPayError("Payment verification failed. Please contact us before retrying.");
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch (e) {
      setPaying(false);
      setPayError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  };

  const copyOrder = () => {
    if (!order) return;
    const items = order.items
      .map(
        (it) =>
          ` • ${it.name}${it.variant !== "—" ? " (" + it.variant + ")" : ""} — ${
            it.perKg ? it.qty + "kg" : it.qty + " × " + it.weight
          } = ${rupee(it.line)}`,
      )
      .join("\n");
    const txt = `HARIPRABODHAM SWEETS — ORDER ${order.id}
Payment ref: ${order.payId}
----------------------------------------
${order.area === "mumbai" ? "Within Mumbai" : "Other state"} | Deliver by: ${order.deliverBy}

ITEMS
${items}
Subtotal: ${rupee(order.subtotal)}
Delivery: ${order.delivery ? rupee(order.delivery) : "Free"}${order.emg ? "\nEmergency: " + rupee(order.emg) : ""}
TOTAL PAID: ${rupee(order.total)} (${order.payMethod.toUpperCase()})

DELIVER TO
${order.name} | ${order.phone} | ${order.email}
${order.addr}
${order.city}, ${order.state} - ${order.pin}
${order.notes ? "Notes: " + order.notes : ""}`;
    navigator.clipboard?.writeText(txt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const resetAll = () => {
    clear();
    setForm(BLANK);
    setErrors({});
    setOrder(null);
    setPayError(null);
    setPaying(false);
    setStep("stepCart");
    closeCart();
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className={"scrim" + (isOpen ? " show" : "")} onClick={closeCart} />
      <aside
        className={"drawer" + (isOpen ? " show" : "")}
        role="dialog"
        aria-modal="true"
        aria-label="Cart and checkout"
        aria-hidden={!isOpen}
        ref={drawerRef}
      >
        <header>
          <h3>{TITLES[step]}</h3>
          <button className="closeb" onClick={closeCart} aria-label="Close">
            ×
          </button>
        </header>

        {/* STEP: CART */}
        <div className={"step" + (step === "stepCart" ? " on" : "")}>
          <div className="dbody">
            {cart.length === 0 ? (
              <div className="empty">
                Your cart is empty.
                <br />
                Add some sweets to begin 🪔
              </div>
            ) : (
              cart.map((it, i) => {
                const q = it.perKg ? `${it.qty} kg` : `${it.qty} × ${it.weight}`;
                return (
                  <div className="litem" key={it.key + "-" + i}>
                    <div className="m">
                      <b>{it.name}</b>
                      <span>
                        {it.variant !== "—" ? it.variant + " · " : ""}
                        {q} · {rupee(it.unit)}
                        {it.perKg ? "/kg" : "/" + it.weight}
                      </span>
                    </div>
                    <div className="litem-end">
                      <span className="lp num">{rupee(it.unit * it.qty)}</span>
                      <button
                        className="rm"
                        onClick={() => remove(i)}
                        aria-label={`Remove ${it.name} from cart`}
                        title="Remove"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="dfoot">
            <div className="sumrow total">
              <span>Subtotal</span>
              <span className="num">{rupee(subtotal)}</span>
            </div>
            <button className="cta-full" onClick={goDetails} disabled={cart.length === 0 || !ordersOpen}>
              Add details &amp; pay
            </button>
          </div>
        </div>

        {/* STEP: DETAILS */}
        <div className={"step" + (step === "stepDetails" ? " on" : "")}>
          <div className="dbody">
            <div className="note-s">
              📦 We pack to order. Give us the correct address so your sweets reach you on time — last year a few
              out-of-state orders got delayed, and we&apos;ve fixed that.
            </div>
            <p className="lab">Where is this going?</p>
            <div className="area">
              <div
                className={"opt" + (area === "mumbai" ? " on" : "")}
                role="button"
                tabIndex={0}
                onClick={() => setArea("mumbai")}
                onKeyDown={(e) => onChipKey(e, () => setArea("mumbai"))}
              >
                Within Mumbai<small>Free delivery</small>
              </div>
              <div
                className={"opt" + (area === "other" ? " on" : "")}
                role="button"
                tabIndex={0}
                onClick={() => setArea("other")}
                onKeyDown={(e) => onChipKey(e, () => setArea("other"))}
              >
                Other state<small>+ delivery</small>
              </div>
            </div>
            {area === "mumbai" && (
              <div className="emg" style={{ display: "flex" }}>
                <input type="checkbox" id="emgChk" checked={emg} onChange={(e) => setEmg(e.target.checked)} />
                <label htmlFor="emgChk" style={{ margin: 0 }}>
                  Emergency Mumbai delivery <span style={{ color: "#6c5836" }}>(+ {rupee(CONFIG.emergencyMumbai)})</span>
                </label>
              </div>
            )}
            <label className="f">
              <span className="l">
                Full name <i>*</i>
              </span>
              <input
                className={"inp" + (errors.name ? " bad" : "")}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Name for the order"
                autoComplete="name"
              />
              {errors.name && <div className="err show">Please enter a name.</div>}
            </label>
            <div className="row2">
              <label className="f">
                <span className="l">
                  Phone <i>*</i>
                </span>
                <input
                  className={"inp" + (errors.phone ? " bad" : "")}
                  value={form.phone}
                  onChange={(e) => setField("phone", digits(e.target.value))}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile"
                  autoComplete="tel"
                />
                {errors.phone && <div className="err show">Enter a valid 10-digit number.</div>}
              </label>
              <label className="f">
                <span className="l">
                  Email <i>*</i>
                </span>
                <input
                  className={"inp" + (errors.email ? " bad" : "")}
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="For confirmation"
                  autoComplete="email"
                />
                {errors.email && <div className="err show">Enter a valid email.</div>}
              </label>
            </div>
            {isBulk && (
              <label className="f">
                <span className="l">
                  Deliver by <i>*</i>
                </span>
                <input
                  className={"inp" + (errors.date ? " bad" : "")}
                  type="date"
                  value={form.date}
                  min={today}
                  onChange={(e) => setField("date", e.target.value)}
                />
                {errors.date && <div className="err show">Pick a delivery date.</div>}
              </label>
            )}
            <label className="f">
              <span className="l">
                Address <i>*</i>
              </span>
              <input
                className={"inp" + (errors.addr1 ? " bad" : "")}
                value={form.addr1}
                onChange={(e) => setField("addr1", e.target.value)}
                placeholder="Flat / house, building, street"
                autoComplete="address-line1"
              />
              {errors.addr1 && <div className="err show">Please enter the address.</div>}
            </label>
            <label className="f">
              <span className="l">Area / landmark</span>
              <input
                className="inp"
                value={form.land}
                onChange={(e) => setField("land", e.target.value)}
                placeholder="Helps delivery reach you"
                autoComplete="address-line2"
              />
            </label>
            <div className="row2">
              <label className="f">
                <span className="l">
                  City <i>*</i>
                </span>
                <input
                  className={"inp" + (errors.city ? " bad" : "")}
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  placeholder="City"
                  autoComplete="address-level2"
                />
                {errors.city && <div className="err show">Required.</div>}
              </label>
              <label className="f">
                <span className="l">
                  Pincode <i>*</i>
                </span>
                <input
                  className={"inp" + (errors.pin ? " bad" : "")}
                  value={form.pin}
                  onChange={(e) => setField("pin", digits(e.target.value))}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6 digits"
                  autoComplete="postal-code"
                />
                {errors.pin && <div className="err show">Enter a valid 6-digit pincode.</div>}
              </label>
            </div>
            <label className="f">
              <span className="l">
                State <i>*</i>
              </span>
              <select className={"inp" + (errors.state ? " bad" : "")} value={form.state} onChange={(e) => setField("state", e.target.value)}>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && <div className="err show">Select a state.</div>}
            </label>
            <label className="f">
              <span className="l">Delivery instructions</span>
              <textarea
                className="inp"
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Preferred time, gate code, anything we should know"
              />
            </label>
            <button className="cta-full" onClick={goPay}>
              Continue to payment
            </button>
            <button className="back" onClick={() => setStep("stepCart")}>
              ← Back to cart
            </button>
          </div>
        </div>

        {/* STEP: PAY */}
        <div className={"step" + (step === "stepPay" ? " on" : "")}>
          <div className="dbody">
            <div className="sumrow">
              <span>Subtotal</span>
              <span className="num">{rupee(subtotal)}</span>
            </div>
            <div className="sumrow">
              <span>{area === "mumbai" ? "Delivery (Mumbai)" : "Delivery (out-of-state)"}</span>
              <span className="num">{deliveryFee ? rupee(deliveryFee) : "Free"}</span>
            </div>
            {emgFee > 0 && (
              <div className="sumrow" style={{ display: "flex" }}>
                <span>Emergency delivery</span>
                <span className="num">{rupee(emgFee)}</span>
              </div>
            )}
            <div className="sumrow total">
              <span>To pay</span>
              <span className="num">{rupee(grand)}</span>
            </div>
            {area !== "mumbai" && (
              <div className="note-s">
                Out-of-state delivery is a flat estimate — our team confirms the exact charge for your pincode after you
                order.
              </div>
            )}
            <div className="note-s">
              Your order is confirmed only once payment is complete — that locks your slot before the cutoff.
            </div>
            <p className="lab">Payment method</p>
            {PAY_OPTIONS.map(([k, t, sub]) => (
              <div
                key={k}
                className={"pay-opt" + (pay === k ? " on" : "")}
                role="button"
                tabIndex={0}
                onClick={() => setPay(k)}
                onKeyDown={(e) => onChipKey(e, () => setPay(k))}
              >
                <span className="dot" />
                <div>
                  <b>{t}</b>
                  <div style={{ color: "var(--muted-d)", fontSize: ".8rem" }}>{sub}</div>
                </div>
              </div>
            ))}
            {payError && (
              <div className="note-s" style={{ background: "rgba(181,64,47,.12)", color: "#7a2417" }}>
                {payError}
              </div>
            )}
            <button className="cta-full" onClick={payNow} disabled={paying}>
              {paying ? "Opening payment…" : "Pay & confirm order"}
            </button>
            <button className="back" onClick={() => setStep("stepDetails")}>
              ← Back to details
            </button>
          </div>
        </div>

        {/* STEP: DONE */}
        <div className={"step" + (step === "stepDone" ? " on" : "")}>
          <div className="dbody confirm">
            <div className="tick">✓</div>
            <h3 className="disp" style={{ fontFamily: "var(--font-bricolage)", fontWeight: 800 }}>
              Order confirmed — dhanyavaad
            </h3>
            <p style={{ color: "var(--muted-d)", margin: "6px 0" }}>
              Your sweets are reserved. We&apos;ll pack and deliver in time.
            </p>
            <div className="oid num">{order?.id ?? "—"}</div>
            {order && (
              <div className="summary">
                {(
                  [
                    ["Deliver to", `${order.name}, ${order.city} (${order.state})`],
                    ["Phone", order.phone],
                    ["Deliver by", order.deliverBy],
                    ["Paid", rupee(order.total)],
                  ] as [string, string][]
                ).map((r, i) => (
                  <div key={i}>
                    <span style={{ color: "var(--muted-d)" }}>{r[0]}</span>
                    <b>{r[1]}</b>
                  </div>
                ))}
              </div>
            )}
            <button className="copyb" onClick={copyOrder}>
              {copied ? "Copied ✓" : "Copy full order details"}
            </button>
            <button className="back" onClick={resetAll}>
              Place another order
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
