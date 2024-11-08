import { Chat } from '@/components/chat'
import { nanoid } from 'nanoid'
import { redirect } from 'next/navigation'

export default function NewPage() {
  const id = nanoid()
  redirect(`/chat/${id}`)
}
