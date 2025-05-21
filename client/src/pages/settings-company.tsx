import React from "react";
import { CompanySettings } from "@/modules/Settings/CompanySettings";

export default function SettingsCompanyPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Perfil da Empresa</h2>
      </div>
      <CompanySettings />
    </div>
  );
}