import { About } from '@/components/sections/About';
import { Categories } from '@/components/sections/Categories';
import { CityGrid } from '@/components/sections/CityGrid';
import { CTABand } from '@/components/sections/CTABand';
import { FeaturedGrid } from '@/components/sections/FeaturedGrid';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { NavBar } from '@/components/sections/NavBar';
import { Testimonials } from '@/components/sections/Testimonials';

export default function HomePage() {
  return (
    <>
      <NavBar />
      <Hero />
      <Categories />
      <CityGrid />
      <FeaturedGrid />
      <HowItWorks />
      <Testimonials />
      <About />
      <CTABand />
      <Footer />
    </>
  );
}
