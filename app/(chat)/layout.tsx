'use client'

import { ChatSidebar } from '@/components/chat-sidebar'

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ChatSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
