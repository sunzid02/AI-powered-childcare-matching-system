import { Route, Routes } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import ParentRequestPage from "./pages/ParentRequestPage";
import MatchResultsPage from "./pages/MatchResultsPage";
import ChildminderDetailPage from "./pages/ChildminderDetailPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ApprovalPage from "./pages/ApprovalPage";

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/request" element={<ParentRequestPage />} />
        <Route path="/matches/:requestId" element={<MatchResultsPage />} />
        <Route path="/childminders/:id" element={<ChildminderDetailPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/approval" element={<ApprovalPage />} />
      </Routes>
    </div>
  );
}