import React from "react";
import { GoalsSettings } from "@/modules/Settings/GoalsSettings";

export default function SettingsGoalsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Metas e Gamificação</h2>
      </div>
      <GoalsSettings />
    </div>
  );
}