import { useState, useRef, useEffect } from 'react'
import { useUIStore } from '@/store/ui'
import { useProjectStore } from '@/store/project'
import { askCosmo } from '@/ai/client'
import { buildProjectContext } from '@/ai/context'
import { applyProposal } from '@/ai/proposalToBlocks'
import { opcodeRegistry } from '@/scratch/opcodes'
import type { ProposedBlock, ChatMessage } from '@/types'

export interface CosmoChatProps {
  className?: string
}

function BlockPreview({ blocks }: { blocks: ProposedBlock[] }) {
  return (
    <div className="mt-2 flex flex-col gap-0.5">
      {blocks.map((block, i) => {
        const info = opcodeRegistry.getByOpcode(block.opcode)
        if (!info) return null
        return (
          <div key={i}>
            <div
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-nunito text-xs font-semibold text-white shadow-sm"
              style={{ backgroundColor: info.color }}
            >
              {info.label.replace(/\{[A-Z_]+\}/g, (match) => {
                const name = match.slice(1, -1)
                const inputVal = block.inputs?.[name]
                const fieldVal = block.fields?.[name]
                return String(inputVal ?? fieldVal ?? '...')
              })}
            </div>
            {block.children?.SUBSTACK && (
              <div className="ml-4 border-l-2 pl-2" style={{ borderColor: info.color }}>
                <BlockPreview blocks={flattenChain(block.children.SUBSTACK)} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function flattenChain(block: ProposedBlock): ProposedBlock[] {
  const result: ProposedBlock[] = []
  let current: ProposedBlock | undefined = block
  while (current) {
    result.push(current)
    current = current.next
  }
  return result
}

function MessageBubble({
  message,
  onAccept,
  onRetry,
}: {
  message: ChatMessage
  onAccept?: () => void
  onRetry?: () => void
}) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-app-cosmo to-cyan-600 text-[10px] font-bold text-white shadow-sm">
          C
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
          isUser
            ? 'bg-app-primary text-white'
            : 'bg-gray-100 text-app-text'
        }`}
      >
        <p className="font-nunito whitespace-pre-wrap">{message.content}</p>
        {message.proposedBlocks && !message.accepted && (
          <>
            <BlockPreview blocks={message.proposedBlocks.blocks} />
            <div className="mt-2 flex gap-2">
              <button
                onClick={onAccept}
                className="rounded-md bg-app-success px-3 py-1 text-xs font-semibold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                Accept
              </button>
              <button
                onClick={onRetry}
                className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-app-secondaryText shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                Try different
              </button>
            </div>
          </>
        )}
        {message.proposedBlocks && message.accepted && (
          <p className="mt-1 text-xs text-app-success font-medium">Added to canvas!</p>
        )}
      </div>
    </div>
  )
}

export function CosmoChat({ className = '' }: CosmoChatProps) {
  const [inputValue, setInputValue] = useState('')
  const chatMessages = useUIStore((s) => s.chatMessages)
  const addUserMessage = useUIStore((s) => s.addUserMessage)
  const addCosmoMessage = useUIStore((s) => s.addCosmoMessage)
  const isCosmoThinking = useUIStore((s) => s.isCosmoThinking)
  const setCosmoThinking = useUIStore((s) => s.setCosmoThinking)
  const markAccepted = useUIStore((s) => s.markAccepted)
  const vm = useProjectStore((s) => s.vm)
  const editingTargetId = useProjectStore((s) => s.editingTargetId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isCosmoThinking])

  const handleSend = async (text?: string) => {
    const trimmed = (text ?? inputValue).trim()
    if (!trimmed || isCosmoThinking) return
    setInputValue('')
    addUserMessage(trimmed)
    setCosmoThinking(true)

    try {
      const context = vm ? buildProjectContext(vm) : {
        sprites: [],
        activeSpriteName: 'Sprite1',
        activeSpriteId: '',
      }
      const response = await askCosmo({
        userMessage: trimmed,
        projectContext: context,
        conversationHistory: chatMessages,
      })
      addCosmoMessage(response.explanation, response.proposedBlocks)
    } catch {
      addCosmoMessage("Oops, my brain glitched! Try again? 🔧")
    } finally {
      setCosmoThinking(false)
    }
  }

  const handleAccept = (message: ChatMessage) => {
    if (!message.proposedBlocks || !editingTargetId) return
    applyProposal(message.proposedBlocks, editingTargetId)
    markAccepted(message.id)
    addCosmoMessage("Done! Click the green flag to try it out 🟢")
  }

  const handleRetry = (message: ChatMessage) => {
    void handleSend(`Try a different approach for: ${message.content || 'the previous request'}`)
  }

  return (
    <section
      className={`flex flex-col border-t border-app-border bg-app-panel ${className}`}
      aria-label="Cosmo chat"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-2">
        <div className="flex gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-app-cosmo to-cyan-600 text-[10px] font-bold text-white shadow-sm">
            C
          </div>
          <div className="max-w-[80%] rounded-xl bg-gray-100 px-3 py-2">
            <p className="font-nunito text-sm text-app-text">
              Hi! I'm Cosmo — tell me what you want to build and I'll help you make it!
            </p>
          </div>
        </div>
        {chatMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onAccept={() => handleAccept(msg)}
            onRetry={() => handleRetry(msg)}
          />
        ))}
        {isCosmoThinking && (
          <div className="flex gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-app-cosmo to-cyan-600 text-[10px] font-bold text-white shadow-sm">
              C
            </div>
            <div className="inline-flex items-center gap-1 rounded-xl bg-gray-100 px-4 py-2">
              <span className="h-2 w-2 animate-bounce rounded-full bg-app-cosmo" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-app-cosmo" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-app-cosmo" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-app-border px-4 py-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void handleSend()
            }
          }}
          disabled={isCosmoThinking}
          placeholder={isCosmoThinking ? 'Cosmo is thinking...' : 'Tell Cosmo what to build...'}
          className="min-w-0 flex-1 rounded-full border border-app-border bg-white px-4 py-2 font-inter text-sm text-app-text outline-none placeholder:text-app-secondaryText focus:border-app-cosmo focus:ring-2 focus:ring-app-cosmo/20 disabled:opacity-50"
          aria-label="Chat input"
        />
        <button
          onClick={() => void handleSend()}
          disabled={isCosmoThinking || !inputValue.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-app-cosmo to-cyan-600 text-white shadow-sm transition-all hover:shadow-md disabled:opacity-40"
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </section>
  )
}
