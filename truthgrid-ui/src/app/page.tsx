import LandingNav from '@/components/Landing/LandingNav';
import HeroSection from '@/components/Landing/HeroSection';
import BrutalAnalysisSection from '@/components/Landing/BrutalAnalysisSection';
import WhatWorksSection from '@/components/Landing/WhatWorksSection';
import GapTableSection from '@/components/Landing/GapTableSection';
import CompetitionSection from '@/components/Landing/CompetitionSection';
import RoadmapSection from '@/components/Landing/RoadmapSection';
import MonetizationSection from '@/components/Landing/MonetizationSection';
import DoThisNowSection from '@/components/Landing/DoThisNowSection';
import FooterCTASection from '@/components/Landing/FooterCTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <LandingNav />
      <HeroSection />
      <BrutalAnalysisSection />
      <WhatWorksSection />
      <GapTableSection />
      <CompetitionSection />
      <RoadmapSection />
      <MonetizationSection />
      <DoThisNowSection />
      <FooterCTASection />
    </div>
  );
}