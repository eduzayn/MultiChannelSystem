import React from "react";
import { SettingsModule } from "@/modules/Settings";
import { AISettingsModule } from "@/modules/Settings/AISettings";

export default function AISettingsPage() {
  return (
    <SettingsModule>
      <AISettingsModule />
    </SettingsModule>
  );
}