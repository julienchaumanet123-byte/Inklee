import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { StudiosStrip } from "@/components/marketing/studios-strip";
import { Stats } from "@/components/marketing/stats";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Features } from "@/components/marketing/features";
import { ClientShowcase } from "@/components/marketing/client-showcase";
import { Pricing } from "@/components/marketing/pricing";
import { Testimonials } from "@/components/marketing/testimonials";
import { FAQ } from "@/components/marketing/faq";
import { CTAStrip } from "@/components/marketing/cta-strip";
import { Footer } from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <Hero />
      <StudiosStrip />
      <Stats />
      <HowItWorks />
      <Features />
      <ClientShowcase />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTAStrip />
      <Footer />
    </main>
  );
}
