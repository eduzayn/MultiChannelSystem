import React from 'react';
import InboxComponent from '@/modules/Inbox';

export default function Inbox() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <InboxComponent />
    </div>
  );
}