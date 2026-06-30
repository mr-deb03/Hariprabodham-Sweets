"use client";

import { useEffect, useState } from "react";
import { daysLeft, cutReg, cutBulk, fmt } from "@/lib/config";

export default function Announce() {
  const [dl, setDl] = useState<number | null>(null);

  useEffect(() => {
    setDl(daysLeft(cutReg));
  }, []);

  const closed = dl !== null && dl <= 0;

  return (
    <div className={"announce" + (closed ? " closed" : "")}>
      {dl === null ? (
        <>🪔 Open once a year — only for Diwali</>
      ) : closed ? (
        <>
          Orders for this Diwali are <b>closed</b> — see you next year. 🙏
        </>
      ) : (
        <>
          🪔 Open once a year — only for Diwali · Last order <b>{fmt(cutReg)}</b> (Mumbai) · <b>{fmt(cutBulk)}</b> (bulk
          &amp; corporate) · <b>{dl} days</b> left
        </>
      )}
    </div>
  );
}
