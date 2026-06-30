"use client";

import { useEffect, useState } from "react";

type Diya = { left: string; top: string; delay: string };

export default function Diyas() {
  // generated after mount so server/client markup match (avoids hydration mismatch)
  const [diyas, setDiyas] = useState<Diya[]>([]);

  useEffect(() => {
    setDiyas(
      Array.from({ length: 16 }, () => ({
        left: Math.random() * 100 + "%",
        top: Math.random() * 90 + "%",
        delay: Math.random() * 3 + "s",
      })),
    );
  }, []);

  return (
    <div className="diyas" aria-hidden="true">
      {diyas.map((d, i) => (
        <span key={i} className="diya" style={{ left: d.left, top: d.top, animationDelay: d.delay }} />
      ))}
    </div>
  );
}
