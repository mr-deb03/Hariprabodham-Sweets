import { CONFIG } from "@/lib/config";

const BENEFITS = [
  { ic: "🤲", t: "Handmade to order", s: "Made fresh, never mass-produced" },
  { ic: "🌿", t: "Pure ingredients", s: "Cashew & ghee, no preservatives" },
  { ic: "🪔", t: "Only for Diwali", s: "We open once a year" },
  { ic: "❤️", t: "100% profit to seva", s: "Every rupee to the cause" },
];

export default function Quality() {
  return (
    <section className="quality">
      <div className="wrap">
        <p className="heritage">
          <span className="est">Since {CONFIG.ESTABLISHED}</span> Handmade every Diwali, the same recipe, for eight years.
        </p>
        <div className="qrow">
          {BENEFITS.map((b) => (
            <div className="qitem" key={b.t}>
              <span className="qic" aria-hidden="true">
                {b.ic}
              </span>
              <b>{b.t}</b>
              <small>{b.s}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
