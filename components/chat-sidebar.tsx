'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { Chat } from '@/lib/types'
import { cn } from '@/lib/utils'

export function ChatSidebar() {
  const router = useRouter()
  const [chatSessions, setChatSessions] = useLocalStorage<Chat[]>('chat-sessions', [])
  const [activeChat, setActiveChat] = useLocalStorage<string>('active-chat', '')

  const createNewChat = () => {
    const newChat: Chat = {
      id: Math.random().toString(36).substring(7),
      title: `Chat ${chatSessions.length + 1}`,
      createdAt: new Date(),
      userId: 'local',
      path: `/chat/${Math.random().toString(36).substring(7)}`,
      messages: []
    }
    setChatSessions([...chatSessions, newChat])
    setActiveChat(newChat.id)
    router.push(newChat.path)
  }

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChatSessions(chatSessions.filter(chat => chat.id !== chatId))
    if (activeChat === chatId) {
      const remainingChats = chatSessions.filter(chat => chat.id !== chatId)
      if (remainingChats.length > 0) {
        setActiveChat(remainingChats[0].id)
        router.push(remainingChats[0].path)
      } else {
        setActiveChat('')
        router.push('/')
      }
    }
  }

  const selectChat = (chat: Chat) => {
    setActiveChat(chat.id)
    router.push(chat.path)
  }

  const getLastMessagePreview = (messages: any[]) => {
    if (messages.length === 0) return 'No messages yet'
    const lastMessage = messages[messages.length - 1]
    if (typeof lastMessage.content === 'string') {
      return lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '')
    }
    return 'Message'
  }

  return (
    <div className="w-[250px] xl:w-[300px] h-screen border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col bg-muted/30">
      <Button 
        onClick={createNewChat}
        className="w-full mb-4 flex items-center gap-2"
        variant="outline"
      >
        <span className="text-xl">+</span>
        New Chat
      </Button>
      
      <div className="flex-1 overflow-auto space-y-2">
        {chatSessions.map(chat => (
          <div 
            key={chat.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg cursor-pointer group hover:bg-accent/50 transition-colors",
              activeChat === chat.id && "bg-accent"
            )}
            onClick={() => selectChat(chat)}
          >
            <div className="truncate flex-1">
              <span className="text-sm font-medium">{chat.title}</span>
              <p className="text-xs text-muted-foreground truncate">
                {getLastMessagePreview(chat.messages)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => deleteChat(chat.id, e)}
            >
              <span className="sr-only">Delete chat</span>
              <span className="text-muted-foreground hover:text-destructive">×</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
