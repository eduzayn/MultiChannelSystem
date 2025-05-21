import React from "react";
import { ZAPIIntegration } from "./components/ZAPIIntegration";

export const ChannelsSettingsModule = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Canais de Comunicação</h2>
      <p className="text-muted-foreground mb-6">
        Configure os canais de comunicação com seus clientes
      </p>
      <ZAPIIntegration />
    </div>
  );
};