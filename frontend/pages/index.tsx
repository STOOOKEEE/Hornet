import { useState } from "react";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { Features } from "../components/Features";
import { HowItWorks } from "../components/HowItWorks";
import { AIOptimization } from "../components/AIOptimization";
import { Security } from "../components/Security";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { DashboardPage } from "../components/DashboardPage";

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <DashboardPage onBackToHome={() => setShowDashboard(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Navbar onLaunchApp={() => setShowDashboard(true)} />
      <LoadingAnimation onLaunchApp={() => setShowDashboard(true)} />
      <Features />
      <AIOptimization />
      <HowItWorks />
      <Security />
      <Footer />
    </div>
  );
}
