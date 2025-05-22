import React from 'react';
import { InboxPanel } from '@/modules/Inbox/components/InboxPanel';
import ConversationView from '@/modules/Inbox/components/ConversationView';
import ContextPanel from '@/modules/Inbox/components/ContextPanel';

export default function Inbox() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Layout principal da Caixa de Entrada Unificada com 3 painéis */}
      <div className="flex flex-1 overflow-hidden">
        <InboxPanel />
        <ConversationView />
        <ContextPanel />
      </div>
    </div>
  );
}