import React from "react";
import { NotificationsSettings } from "@/modules/Settings/NotificationsSettings";

export default function SettingsNotificationsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações de Notificações</h2>
      </div>
      <NotificationsSettings />
    </div>
  );
}