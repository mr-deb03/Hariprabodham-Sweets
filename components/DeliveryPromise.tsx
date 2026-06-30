import { CONFIG, rupee } from "@/lib/config";

export default function DeliveryPromise() {
  return (
    <section className="promise" id="promise">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Our delivery promise</span>
          <h2 className="disp">Nothing gets missed this year</h2>
        </div>
        <div className="pgrid">
          <div className="pitem">
            <div className="ic">🛵</div>
            <h4>Free across Mumbai</h4>
            <p>Every Mumbai order is delivered free, in time for Diwali.</p>
            <span className="tag">₹0 delivery</span>
          </div>
          <div className="pitem">
            <div className="ic">📦</div>
            <h4>Pan-India by 6 Nov</h4>
            <p>Out-of-state orders are packed and shipped to arrive 2 days before Diwali.</p>
            <span className="tag">Delivery charges apply</span>
          </div>
          <div className="pitem">
            <div className="ic">⚡</div>
            <h4>Emergency? Mumbai only</h4>
            <p>
              Need it fast inside Mumbai? We can rush it for a small extra charge. No emergency option outside Mumbai —
              order early.
            </p>
            <span className="tag">{rupee(CONFIG.emergencyMumbai)} extra</span>
          </div>
          <div className="pitem">
            <div className="ic">🎁</div>
            <h4>Bulk &amp; corporate</h4>
            <p>
              Large and corporate orders are delivered by the date you choose — place them 2 weeks ahead so we can pack
              on time.
            </p>
            <span className="tag">2-week lead time</span>
          </div>
        </div>
      </div>
    </section>
  );
}
