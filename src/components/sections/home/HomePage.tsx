import Header from "../../layout/Header";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import Footer from "./Footer";
import MotivationalSection from "./MotivationalSection";
import TestemunhosSection from "./TestemunhosSection";
import ProfissionaisSection from "./ProfissionaisSection";
import ClinicasSection from "./ClinicasSection";
import PacientesSection from "./PacientesSection";
import EmpresasSection from "./EmpresasSection";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <PacientesSection />
      <ProfissionaisSection />
      <ClinicasSection />
      <EmpresasSection />
      <FeaturesSection />
      <TestemunhosSection />
      <MotivationalSection />
      <Footer />
    </>
  );
}
