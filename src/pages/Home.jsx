import PageShell from "../components/layout/PageShell";
import HeroSection from "../components/home/HeroSection";
import CollectionsSection from "../components/home/CollectionsSection";
import BestSellingSection from "../components/home/BestSellingSection";
import RatingsSection from "../components/home/RatingsSection";
import ContactSection from "../components/home/ContactSection";

export default function Home() {
  return (
    <PageShell showBack={false} container={false}>
      <HeroSection />
      <CollectionsSection />
      <BestSellingSection />
      <RatingsSection />
      <ContactSection />
    </PageShell>
  );
}
