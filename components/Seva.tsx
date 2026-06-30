import { CONFIG } from "@/lib/config";

export default function Seva() {
  return (
    <section className="seva" id="seva">
      <div className="wrap">
        <span className="eyebrow">Why we do this</span>
        <p className="big disp" style={{ marginTop: 14 }}>
          Eight Diwalis. Over 20,000 kg of kaju katli. <em>Not one rupee of profit kept for us.</em>
        </p>
        <p>
          Hariprabodham Sweets opens only for Diwali. We make and sell these two sweets, and the entire profit goes to{" "}
          <span style={{ color: "var(--gold)", fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: CONFIG.CAUSE_HTML }} />
          . When you order, you become part of that seva — so thank you, truly.
        </p>
        <div className="sevarow">
          <div>
            <span className="num">20,000+</span>
            <small>kg sold for the cause</small>
          </div>
          <div>
            <span className="num">8</span>
            <small>years and counting</small>
          </div>
          <div>
            <span className="num">100%</span>
            <small>profit donated</small>
          </div>
        </div>
      </div>
    </section>
  );
}
