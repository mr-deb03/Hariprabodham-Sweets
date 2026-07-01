export default function Hero() {
  return (
    <header className="hero">
      <div className="wrap">
        <span className="badge-offer">
          🪔 Diwali drop is live — <b>save up to 30%</b> this week
        </span>
        <h1 className="disp">
          The <span className="gold-text">kaju katli</span> Mumbai waits all year for.
        </h1>
        <p className="sub">
          We open once a year — only for Diwali. Two sweets, made by hand, and every rupee of profit goes to our seva.
        </p>
        <div className="pricehook">
          <span className="new num">₹1400</span>
          <span className="old num">₹2000</span>
          <span className="per">/ kg Kaju Katli</span>
          <span className="save">Save ₹600</span>
        </div>
        <div className="cta">
          <a className="btn" href="#shop">
            Order now
          </a>
          <a className="btn ghost" href="#seva">
            Where the profit goes
          </a>
        </div>
        <p className="trust">
          <span>
            <b>8</b> Diwalis
          </span>
          <span className="dot" />
          <span>
            <b>20,000+ kg</b> sold
          </span>
          <span className="dot" />
          <span>
            <b>100%</b> of profit to seva
          </span>
        </p>
      </div>
    </header>
  );
}
