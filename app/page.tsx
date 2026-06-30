import Announce from "@/components/Announce";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Shop from "@/components/Shop";
import DeliveryPromise from "@/components/DeliveryPromise";
import Seva from "@/components/Seva";
import Reviews from "@/components/Reviews";
import Corporate from "@/components/Corporate";
import Faq from "@/components/Faq";
import SiteFooter from "@/components/SiteFooter";

export default function Page() {
  return (
    <>
      <Announce />
      <Nav />
      <Hero />
      <Shop />
      <DeliveryPromise />
      <Seva />
      <Reviews />
      <Corporate />
      <Faq />
      <SiteFooter />
    </>
  );
}
