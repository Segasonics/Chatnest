import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/landing/HeroSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import FeatureCardsSection from '../components/landing/FeatureCardsSection';
import InteractiveDemoSection from '../components/landing/InteractiveDemoSection';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsFaqSection from '../components/landing/TestimonialsFaqSection';

function LandingPage() {
  return (
    <div className="app-shell-bg min-h-screen text-white">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FeatureCardsSection />
      <InteractiveDemoSection />
      <PricingSection />
      <TestimonialsFaqSection />
      <Footer />
    </div>
  );
}

export default LandingPage;
