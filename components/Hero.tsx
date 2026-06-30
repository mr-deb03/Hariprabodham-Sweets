import Diyas from "./Diyas";

export default function Hero() {
  return (
    <header className="hero">
      <Diyas />
      <div className="wrap">
        <span className="badge-offer">
          🪔 Diwali drop is live — <b>save up to 30%</b> this week
        </span>
        <h1 className="disp">
          The <span className="gold-text">kaju katli</span> Mumbai waits all year for.
        </h1>
        <p className="sub">
          We open once a year — only for Diwali. Two sweets, made by hand, and every rupee of profit goes to our seva.
          Order early, pay to confirm, delivered before the festival.
        </p>
        <div className="pricehook">
          <span className="old num">₹2000</span>
          <span className="new num">₹1400</span>
          <span className="per">/ kg Kaju Katli</span>
          <span className="save">Save ₹600</span>
        </div>
        <div className="cta">
          <a className="btn" href="#shop">
            Order now →
          </a>
          <a className="btn ghost" href="#seva">
            Where the profit goes
          </a>
        </div>
        <div className="stats">
          <div className="stat">
            <b className="num">20,000+ kg</b>
            <span>Kaju Katli sold in 8 Diwalis</span>
          </div>
          <div className="stat">
            <b className="num">1,000+</b>
            <span>happy families &amp; offices</span>
          </div>
          <div className="stat">
            <b className="num">8 years</b>
            <span>of unbroken Diwali seva</span>
          </div>
          <div className="stat">
            <b className="num">100%</b>
            <span>of profit to the cause</span>
          </div>
        </div>
      </div>
    </header>
  );
}
