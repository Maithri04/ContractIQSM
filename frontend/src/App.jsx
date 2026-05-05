import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AppProvider }       from "./context/AppContext";
import { UserProvider, useUser } from "./context/UserContext";

import SplashScreen          from "./components/SplashScreen";
import Login                 from "./components/Login";
import Sidebar               from "./components/Sidebar";

import UploadAnalyzePage     from "./pages/UploadAnalyzePage";
import ComparePage           from "./pages/ComparePage";
import ScenarioPage          from "./pages/ScenarioPage";
import HistoryPage           from "./pages/HistoryPage";
import "./styles/tailwind.css";

function Dashboard() {
  const [activePage, setActivePage] = useState("upload");
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !user) {
      navigate("/login");
    }
  }, [user, isLoaded, navigate]);

  if (!isLoaded || !user) return null;

  return (
    <div className="min-h-screen" style={{ background: "#f0ede6" }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="md:ml-64">
        {activePage === "upload"  && <UploadAnalyzePage />}
        {activePage === "compare" && <ComparePage />}
        {activePage === "scenarios" && <ScenarioPage />}
        {activePage === "history" && <HistoryPage />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </UserProvider>
  );
}