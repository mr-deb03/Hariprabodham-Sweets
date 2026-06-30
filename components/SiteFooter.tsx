"use client";

import { useEffect, useState } from "react";
import { CONFIG } from "@/lib/config";

export default function SiteFooter() {
  const [yr, setYr] = useState("");

  useEffect(() => {
    setYr(String(new Date().getFullYear()));
  }, []);

  return (
    <footer className="site">
      <div className="wrap">
        <div className="top">
          <div style={{ maxWidth: "34ch" }}>
            <div className="nm">Hariprabodham Sweets</div>
            <p style={{ margin: "10px 0 0" }}>
              Made in Mumbai, only for Diwali. Profit to the cause, every single year.
            </p>
          </div>
          <div>
            <p style={{ color: "var(--cream)", fontWeight: 700, margin: "0 0 8px" }}>Reach us</p>
            <p style={{ margin: 0 }}>
              <a href={"tel:" + CONFIG.PHONE.replace(/\s/g, "")}>{CONFIG.PHONE}</a>
            </p>
            <p style={{ margin: "4px 0 0" }}>
              <a href={"https://wa.me/" + CONFIG.WHATSAPP} target="_blank" rel="noopener">
                WhatsApp us
              </a>
            </p>
            <p style={{ margin: "4px 0 0" }}>
              <a href={CONFIG.INSTAGRAM} target="_blank" rel="noopener">
                Instagram
              </a>
            </p>
          </div>
        </div>
        <div className="legal">
          Orders are confirmed only after payment via Razorpay. Order before the cutoff so we can pack and deliver on
          time. © {yr} Hariprabodham Sweets.
        </div>
      </div>
    </footer>
  );
}
