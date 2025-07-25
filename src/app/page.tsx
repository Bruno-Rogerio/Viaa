// ANTES (remover estas linhas)
// import HeroSection from '@/components/HeroSection'
// import FeaturesSection from '@/components/FeaturesSection'
// import MotivationalCarousel from '@/components/MotivationalCarousel'

// DEPOIS (adicionar esta linha)
import { HeroSection, FeaturesSection, MotivationalCarousel } from '@/components/sections/home'
import Footer from '@/components/sections/home/Footer'
import Header from '@/components/sections/home/Header'

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <MotivationalCarousel />
      <Footer/>
    </main>
  )
}
