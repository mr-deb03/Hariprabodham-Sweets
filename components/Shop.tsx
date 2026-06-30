"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { CONFIG, type KatliWeight, rupee, fmt, cutReg, cutBulk } from "@/lib/config";

function PriceBlock({ price, mrp }: { price: number; mrp: number }) {
  const save = mrp - price;
  return (
    <div className="priceblock">
      <span className="new num">{rupee(price)}</span>
      {mrp > price && (
        <>
          <span className="old num">{rupee(mrp)}</span>
          <span className="save">Save {rupee(save)}</span>
        </>
      )}
    </div>
  );
}

function Stepper({ qty, setQty }: { qty: number; setQty: (n: number) => void }) {
  return (
    <div className="stepper">
      <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="less">
        −
      </button>
      <input value={qty} readOnly aria-label="quantity" />
      <button onClick={() => setQty(qty + 1)} aria-label="more">
        +
      </button>
    </div>
  );
}

function KatliCard() {
  const { add } = useCart();
  const [v, setV] = useState(0);
  const [w, setW] = useState<KatliWeight>("250g");
  const [qty, setQty] = useState(1);

  const price = CONFIG.katli[w].price + (v ? CONFIG.katliVarakExtra : 0);
  const mrp = CONFIG.katli[w].mrp + (v ? CONFIG.katliVarakExtra : 0);
  const weights: KatliWeight[] = ["250g", "500g", "1kg"];
  const labels: Record<KatliWeight, string> = { "250g": "250 g", "500g": "500 g", "1kg": "1 kg" };

  return (
    <div className="pcard">
      <div className="ribbon">Diwali offer</div>
      <h3>Kaju Katli</h3>
      <p className="desc">Thin cashew diamonds — soft, rich, melt-in-mouth.</p>
      <div className="lab">Finish</div>
      <div className="seg">
        <button className={v === 0 ? "on" : ""} onClick={() => setV(0)}>
          Without varak
        </button>
        <button className={"varak" + (v === 1 ? " on" : "")} onClick={() => setV(1)}>
          With silver varak<small>same price</small>
        </button>
      </div>
      <div className="lab">Weight</div>
      <div className="seg">
        {weights.map((x) => (
          <button key={x} className={w === x ? "on" : ""} onClick={() => setW(x)}>
            {labels[x]}
          </button>
        ))}
      </div>
      <PriceBlock price={price} mrp={mrp} />
      <div className="buyrow">
        <Stepper qty={qty} setQty={setQty} />
        <button
          className="add"
          onClick={() =>
            add({
              name: "Kaju Katli",
              variant: v ? "With varak" : "Without varak",
              weight: w,
              unit: price,
              qty,
              key: `katli-${v}-${w}`,
            })
          }
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

function PakCard() {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  return (
    <div className="pcard">
      <div className="ribbon" style={{ background: "var(--gold-deep)" }}>
        Diwali offer
      </div>
      <h3>Kaju Pak</h3>
      <p className="desc">Dense, fudgy cashew pak. Made in 1 kg packs only.</p>
      <div className="lab">Weight</div>
      <div className="seg">
        <button className="on" style={{ cursor: "default" }}>
          1 kg only
        </button>
      </div>
      <PriceBlock price={CONFIG.pak["1kg"].price} mrp={CONFIG.pak["1kg"].mrp} />
      <div className="buyrow">
        <Stepper qty={qty} setQty={setQty} />
        <button
          className="add"
          onClick={() =>
            add({ name: "Kaju Pak", variant: "—", weight: "1kg", unit: CONFIG.pak["1kg"].price, qty, key: "pak-1kg" })
          }
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

function BulkCard({ prod }: { prod: "katli" | "pak" }) {
  const { add } = useCart();
  const isK = prod === "katli";
  const rate = isK ? CONFIG.bulkKatliPerKg : CONFIG.bulkPakPerKg;
  const title = isK ? "Kaju Katli" : "Kaju Pak";
  const [v, setV] = useState(0);
  const [kg, setKg] = useState(10);
  const kgs: number[] = [];
  for (let k = 10; k <= 100; k += 10) kgs.push(k);

  return (
    <div className="pcard">
      <h3>{title} — bulk</h3>
      <p className="desc">{isK ? "By total weight. Choose varak below." : "Dense cashew pak, by total weight."}</p>
      {isK && (
        <>
          <div className="lab">Finish</div>
          <div className="seg">
            <button className={v === 0 ? "on" : ""} onClick={() => setV(0)}>
              Without varak
            </button>
            <button className={"varak" + (v === 1 ? " on" : "")} onClick={() => setV(1)}>
              With silver varak
            </button>
          </div>
        </>
      )}
      <div className="lab">Total weight</div>
      <div className="seg" style={{ maxHeight: 120, overflow: "auto" }}>
        {kgs.map((k) => (
          <button key={k} className={kg === k ? "on" : ""} onClick={() => setKg(k)}>
            {k} kg
          </button>
        ))}
      </div>
      <div className="priceblock">
        <span className="new num">{rupee(rate * kg)}</span>
        <span className="old" style={{ textDecoration: "none", color: "var(--muted-d)" }}>
          {kg} kg × {rupee(rate)}/kg
        </span>
      </div>
      <div className="buyrow" style={{ justifyContent: "flex-end" }}>
        <button
          className="add"
          onClick={() =>
            add({
              name: "Bulk " + title,
              variant: isK ? (v ? "With varak" : "Without varak") : "—",
              weight: kg + "kg",
              unit: rate,
              qty: kg,
              perKg: true,
              key: `bulk-${prod}-${v}-${kg}`,
            })
          }
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

export default function Shop() {
  const [mode, setMode] = useState<"regular" | "bulk">("regular");

  return (
    <section className="shop" id="shop">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Order your sweets</span>
          <h2 className="disp">Pick your boxes</h2>
          <p>
            Free delivery across Mumbai. Shipped pan-India to reach you 2 days before Diwali. Choose regular packs or a
            bulk order.
          </p>
        </div>
        <div className="modes">
          <button className={mode === "regular" ? "on" : ""} onClick={() => setMode("regular")}>
            Regular packs
          </button>
          <button className={mode === "bulk" ? "on" : ""} onClick={() => setMode("bulk")}>
            Bulk (10–100 kg)
          </button>
        </div>
        <div className="grid">
          {mode === "regular" ? (
            <>
              <KatliCard />
              <PakCard />
            </>
          ) : (
            <>
              <BulkCard prod="katli" />
              <BulkCard prod="pak" />
            </>
          )}
        </div>
        <div className="modeNote">
          {mode === "regular"
            ? `Retail packs for home. Free Mumbai delivery · out-of-state arrives ${CONFIG.DELIVER_BY}. Order by ${fmt(cutReg)}.`
            : `Orders from 10 kg to 100 kg at per-kg rates. Choose your delivery date at checkout — please order by ${fmt(cutBulk)} so we can pack on time.`}
        </div>
      </div>
    </section>
  );
}
