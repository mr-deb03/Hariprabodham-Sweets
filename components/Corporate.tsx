"use client";

import { useState } from "react";
import { CONFIG } from "@/lib/config";

export default function Corporate() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [req, setReq] = useState("");
  const [badName, setBadName] = useState(false);
  const [badPhone, setBadPhone] = useState(false);
  const [ok, setOk] = useState(false);

  const digits = (s: string) => s.replace(/\D/g, "");

  const send = () => {
    const okN = name.trim().length >= 2;
    const okP = /^[6-9]\d{9}$/.test(phone.trim());
    setBadName(!okN);
    setBadPhone(!okP);
    if (!okN || !okP) return;
    setOk(true);
    // TODO: wire to backend / WhatsApp / email
  };

  return (
    <section className="corp" id="corporate">
      <div className="wrap">
        <span className="eyebrow">Corporate gifting</span>
        <div className="corpcard" style={{ marginTop: 18 }}>
          <div>
            <h3 className="disp">Gift kaju katli to your whole team.</h3>
            <p>
              Custom Diwali boxes for clients and staff, with your branding and gift note. Trusted for corporate gifting
              across 8 Diwalis.
            </p>
            <div className="from">
              Starting ₹1600 <small>/ box · final price by box &amp; volume</small>
            </div>
            <p style={{ fontSize: ".9rem", color: "#cbbcdd" }}>
              Place corporate orders at least 2 weeks before Diwali. Delivered by your chosen date.
            </p>
          </div>
          <div className="enq">
            <p style={{ fontWeight: 700, color: "var(--cream)", margin: "0 0 12px" }}>Contact us for orders</p>
            <input
              className={"field" + (badName ? " bad" : "")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
            <input
              className="field"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              autoComplete="organization"
            />
            <input
              className={"field" + (badPhone ? " bad" : "")}
              value={phone}
              onChange={(e) => setPhone(digits(e.target.value))}
              placeholder="Phone / WhatsApp"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
            />
            <input
              className="field"
              value={req}
              onChange={(e) => setReq(e.target.value)}
              placeholder="No. of boxes / requirement"
            />
            <button className="enqbtn" onClick={send}>
              Send enquiry
            </button>
            <a
              href={"https://wa.me/" + CONFIG.WHATSAPP}
              target="_blank"
              rel="noopener"
              style={{ display: "block", textAlign: "center", marginTop: 10, fontSize: ".86rem", color: "var(--gold)", fontWeight: 700 }}
            >
              or WhatsApp us →
            </a>
            {ok && (
              <div className="enqok" style={{ display: "block" }}>
                ✓ Got it! We&apos;ll call you back shortly.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
