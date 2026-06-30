import { REVIEWS } from "@/lib/config";

export default function Reviews() {
  return (
    <section className="tst" id="reviews">
      <div className="wrap">
        <span className="eyebrow">Loved every Diwali</span>
        <div className="tcount">
          <b className="num">1,000+</b>
          <span>five-star reviews from families and offices across India</span>
        </div>
        <div className="tgrid">
          {REVIEWS.map((r, i) => (
            <div className="tcard" key={i}>
              <div className="stars">★★★★★</div>
              <p>&ldquo;{r.t}&rdquo;</p>
              <div className="who">
                <div className="av">{r.n[0]}</div>
                <div>
                  <b>{r.n}</b>
                  <small>{r.c}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
