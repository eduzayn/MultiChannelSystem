import React from "react";
import { SecuritySettings } from "@/modules/Settings/SecuritySettings";

export default function SettingsSecurityPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações de Segurança</h2>
      </div>
      <SecuritySettings />
    </div>
  );
}