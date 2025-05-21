import { useState } from "react";
import { ChatSidebar } from "@/modules/Chat/components/ChatSidebar";
import { MessagePanel } from "@/modules/Chat/components/MessagePanel";
import { DetailsPanel } from "@/modules/Chat/components/DetailsPanel";

export default function Chat() {
  const [activeChannelId, setActiveChannelId] = useState<string | undefined>();
  const [activeDmId, setActiveDmId] = useState<string | undefined>();
  const [showDetails, setShowDetails] = useState(false);
  
  // Lidar com seleção de canal
  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setActiveDmId(undefined);
  };
  
  // Lidar com seleção de mensagem direta
  const handleSelectDm = (dmId: string) => {
    setActiveDmId(dmId);
    setActiveChannelId(undefined);
  };
  
  // Lidar com criação de canal
  const handleCreateChannel = () => {
    // Simulação de criação de canal
    console.log("Criar novo canal");
  };
  
  // Lidar com criação de mensagem direta
  const handleCreateDm = () => {
    // Simulação de criação de mensagem direta
    console.log("Criar nova mensagem direta");
  };
  
  // Alternar painel de detalhes
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        activeChannelId={activeChannelId}
        activeDmId={activeDmId}
        onSelectChannel={handleSelectChannel}
        onSelectDm={handleSelectDm}
        onCreateChannel={handleCreateChannel}
        onCreateDm={handleCreateDm}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 ${showDetails ? 'block' : 'flex'}`}>
          <MessagePanel
            channelId={activeChannelId}
            dmId={activeDmId}
            onToggleDetails={toggleDetails}
          />
        </div>
        
        {showDetails && (
          <DetailsPanel
            channelId={activeChannelId}
            dmId={activeDmId}
            onClose={() => setShowDetails(false)}
          />
        )}
      </div>
    </div>
  );
}