'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState } from 'ai/rsc'
import { Message, Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { TickerTape } from '@/components/tradingview/ticker-tape'
import { MissingApiKeyBanner } from '@/components/missing-api-key-banner'
import { writeFileSync } from 'fs'; // To write the CSV file
import { parse } from 'json2csv';  // CSV parser
import { saveAs } from 'file-saver'; // To download the file on the client-side

const Halluminate = require('halluminate');
const halluminate = new Halluminate('e069f3d26e2debed3af5d598ebbe2770a750d6f2');

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const [aiState] = useAIState()

  const [csvDataList, setCsvDataList] = useState([]);

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, session?.user, messages])
  
  useEffect(() => {
    const messagesLength = aiState.messages?.length;

    if (messagesLength >= 2) {
      const halluminateMessage = aiState.messages.slice(-2);
      const userMessage = halluminateMessage[0]?.content;
      const responseMessage = halluminateMessage[1]?.content;

      // Perform Halluminate evaluation
      halluminate
        .evaluateBasic(
          "84c3dc34-31f5-41a0-82fe-42b167c3b21c", // Criteria UUID
          responseMessage,
          userMessage,
        )
        .then((response) => {
          const { reasoning, score } = response;

          console.log('Halluminate Score:', score);
          console.log('Halluminate Reasoning:', reasoning);

          // Prepare the new response data to be appended
          const newCsvData = {
            label: score,       // Score from Halluminate response
            context: '',        // Leave context column empty
            prompt: userMessage, // User message as prompt
            response: responseMessage, // Reasoning from Halluminate response
          };

          // Append the new response to the existing csvDataList state
          setCsvDataList((prevData) => [...prevData, newCsvData]);
        })
        .catch((err) => {
          console.error('Error during evaluation:', err);
        });
    }
  }, [aiState.messages, router]);

  useEffect(() => {
    if (csvDataList.length > 0) {
      // Convert to CSV and download the file
      const csv = parse(csvDataList, { fields: ['label', 'context', 'prompt', 'response'] });
      
      // Save CSV to file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'halluminate_evaluation.csv');
    }
  }, [csvDataList]);

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])
  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      {messages.length ? (
        <MissingApiKeyBanner missingKeys={missingKeys} />
      ) : (
        <TickerTape />
      )}

      <div
        className={cn(
          messages.length ? 'pb-[200px] pt-4 md:pt-6' : 'pb-[200px] pt-0',
          className
        )}
        ref={messagesRef}
      >
        {messages.length ? (
          <ChatList messages={messages} isShared={false} session={session} />
        ) : (
          <EmptyScreen />
        )}
        <div className="w-full h-px" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
    </div>
  )
}
