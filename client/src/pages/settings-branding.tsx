import React from "react";
import { BrandingSettings } from "@/modules/Settings/BrandingSettings";

export default function SettingsBrandingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Aparência e Branding</h2>
      </div>
      <BrandingSettings />
    </div>
  );
}