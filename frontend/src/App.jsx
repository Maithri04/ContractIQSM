import React from "react";
import { AppProvider }       from "./context/AppContext";
import UploadAnalyzePage     from "./pages/UploadAnalyzePage";
import "./styles/tailwind.css";

export default function App() {
  return (
    <AppProvider>
      <UploadAnalyzePage />
    </AppProvider>
  );
}