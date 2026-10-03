import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Hero from '../../components/landing/Hero'
import CategoryStrip from '../../components/landing/CategoryStrip'
import HowItWorks from '../../components/landing/HowItWorks'
import FeaturedOpportunities from '../../components/landing/FeaturedOpportunities'
import AudienceSplit from '../../components/landing/AudienceSplit'
import Stats from '../../components/landing/Stats'
import Testimonials from '../../components/landing/Testimonials'
import FinalCta from '../../components/landing/FinalCta'

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <CategoryStrip />
        <HowItWorks />
        <FeaturedOpportunities />
        <AudienceSplit />
        <Stats />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}