import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Hero from '../../components/landing/Hero'
import CategoryStrip from '../../components/landing/CategoryStrip'
import HowItWorks from '../../components/landing/HowItWorks'
import FeaturedOpportunities from '../../components/landing/FeaturedOpportunities'
import AudienceSplit from '../../components/landing/AudienceSplit'
import FinalCta from '../../components/landing/FinalCta'

export default function LandingPage() {
  return (
    <div id="top" className="landing-page min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <CategoryStrip />
        <HowItWorks />
        <FeaturedOpportunities />
        <AudienceSplit />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}