import { DashboardPage } from "../components/DashboardPage";

export default function Dashboard() {
  // On n'a pas besoin de onBackToHome ici, car ce sera une page dédiée
  return <DashboardPage onBackToHome={() => {}} />;
}
