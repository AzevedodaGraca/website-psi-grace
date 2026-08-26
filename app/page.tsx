import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsappFloatingButton from "@/components/shared/WhatsappFloatingButton";

import HeroSection from "@/components/home/HeroSection";
import QuoteSection from "@/components/home/QuoteSection";
import AboutSection from "@/components/home/AboutSection";
import ApproachSection from "@/components/home/ApproachSection";
import ServicesSection from "@/components/home/ServicesSection";
import SpecialtiesSection from "@/components/home/SpecialtiesSection";
import ClinicGallerySection from "@/components/home/ClinicGallerySection";
import LocationContactSection from "@/components/home/LocationContactSection";
import FaqSection from "@/components/home/FaqSection";
import SchedulingSection from "@/components/home/SchedulingSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1d2a23]" id="inicio">
      {/* Header Layout Component */}
      <Header />

      {/* Main Content Container */}
      <main className="flex-1">
        {/* Phase 3 Core Institutional Sections */}
        <HeroSection />
        <QuoteSection />
        <AboutSection />
        <ApproachSection />
        <ServicesSection />
        <SpecialtiesSection />

        {/* Phase 4 Gallery, Location & FAQ Sections */}
        <ClinicGallerySection />
        <LocationContactSection />
        <FaqSection />

        {/* Phase 5 Appointment Scheduling UI */}
        <SchedulingSection />
      </main>

      {/* Footer Layout Component */}
      <Footer />

      {/* Floating WhatsApp Action Button */}
      <WhatsappFloatingButton />
    </div>
  );
}
