import React from "react";
import { MarketingSettings } from "@/modules/Settings/MarketingSettings";

export default function SettingsMarketingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações de Marketing</h2>
      </div>
      <MarketingSettings />
    </div>
  );
}