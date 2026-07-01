"use client";

import { useState } from "react";

export default function NotifySignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("ok");
        setMsg("You're on the list — we'll email you when orders open. 🪔");
        setEmail("");
      } else {
        setStatus("err");
        setMsg(data?.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("err");
      setMsg("Network error. Please try again.");
    }
  };

  return (
    <section className="notify" id="notify">
      <div className="wrap">
        <div className="notifycard">
          <div>
            <h2 className="disp">Only once a year.</h2>
            <p>
              We open for Diwali and close when it&apos;s over. Leave your email and we&apos;ll tell you the moment
              orders open next year — no spam, just the one message.
            </p>
          </div>
          <form className="notifyform" onSubmit={submit}>
            {status === "ok" ? (
              <p className="notifyok">{msg}</p>
            ) : (
              <>
                <div className="notifyrow">
                  <input
                    className="inp"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    autoComplete="email"
                    aria-label="Email address"
                    required
                  />
                  <button className="btn" type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Adding…" : "Notify me"}
                  </button>
                </div>
                {status === "err" && <p className="notifyerr">{msg}</p>}
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
