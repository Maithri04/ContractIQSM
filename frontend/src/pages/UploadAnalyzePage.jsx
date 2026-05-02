import React from "react";
import UploadBox         from "../components/upload/UploadBox";
import ProcessingSteps   from "../components/processing/ProcessingSteps";
import ChatBox           from "../components/chat/ChatBox";
import RiskCard          from "../components/risk/RiskCard";

export default function UploadAnalyzePage() {
  return (
    <>
      {/* Fixed top-right processing tracker */}
      <ProcessingSteps />

      {/* Page content */}
      <div
        className="min-h-screen py-8 px-4"
        style={{ background: "#f0ede6" }}
      >
        <div className="max-w-2xl mx-auto space-y-5">
          {/* 1 — Upload */}
          <UploadBox />

          {/* 2 — Ask (chat) */}
          <ChatBox />

          {/* 3 — Risk score dashboard */}
          <RiskCard />
        </div>
      </div>
    </>
  );
}