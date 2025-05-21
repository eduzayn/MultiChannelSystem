import React from "react";
import { IntegrationsSettings } from "@/modules/Settings/IntegrationsSettings";

export default function SettingsIntegrationsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações de Integrações</h2>
      </div>
      <IntegrationsSettings />
    </div>
  );
}