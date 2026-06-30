"use client";

import { useCart } from "@/lib/cart-context";

export default function Nav() {
  const { count, openCart } = useCart();
  return (
    <nav>
      <div className="wrap">
        <div className="brand">
          <div className="logo" aria-hidden="true" />
          <div>
            <div className="nm">Hariprabodham Sweets</div>
            <small>Diwali Seva · Mumbai</small>
          </div>
        </div>
        <div className="navlinks">
          <a href="#shop">Order</a>
          <a href="#seva">Our seva</a>
          <a href="#reviews">Reviews</a>
          <a href="#corporate">Corporate</a>
        </div>
        <button className="cartbtn" onClick={openCart} aria-label="Open cart">
          🛒 Cart <span className="badge">{count}</span>
        </button>
      </div>
    </nav>
  );
}
