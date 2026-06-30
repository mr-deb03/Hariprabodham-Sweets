"use client";

import { useState } from "react";
import { FAQ } from "@/lib/config";

export default function Faq() {
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set());

  const toggle = (i: number) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section className="faq" id="faq">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Good to know</span>
          <h2 className="disp">Questions, answered</h2>
        </div>
        <div>
          {FAQ.map((q, i) => {
            const isOpen = openSet.has(i);
            return (
              <div className={"qa" + (isOpen ? " open" : "")} key={i}>
                <button aria-expanded={isOpen} onClick={() => toggle(i)}>
                  {q[0]}
                  <span className="pm">+</span>
                </button>
                <div className="a">{q[1]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
