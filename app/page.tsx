import Announce from "@/components/Announce";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Shop from "@/components/Shop";
import Quality from "@/components/Quality";
import DeliveryPromise from "@/components/DeliveryPromise";
import Seva from "@/components/Seva";
import Reviews from "@/components/Reviews";
import Corporate from "@/components/Corporate";
import Faq from "@/components/Faq";
import NotifySignup from "@/components/NotifySignup";
import SiteFooter from "@/components/SiteFooter";

export default function Page() {
  return (
    <>
      <Announce />
      <Nav />
      <Hero />
      <Shop />
      <Quality />
      <DeliveryPromise />
      <Seva />
      <Reviews />
      <Corporate />
      <Faq />
      <NotifySignup />
      <SiteFooter />
    </>
  );
}
