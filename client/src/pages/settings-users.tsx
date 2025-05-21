import React from "react";
import { UsersSettings } from "@/modules/Settings/UsersSettings";

export default function SettingsUsersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações de Usuários e Equipes</h2>
      </div>
      <UsersSettings />
    </div>
  );
}