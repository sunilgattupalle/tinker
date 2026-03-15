import type { ChatMessage, ProposedBlockSet } from '@/types'
import { buildSystemPrompt } from './prompts'
import { parseCosmoResponse } from './parser'

export interface ScriptSummary {
  topBlockOpcode: string
  blockCount: number
  description: string
}

export interface ProjectContext {
  sprites: Array<{
    name: string
    id: string
    scripts: ScriptSummary[]
  }>
  activeSpriteName: string
  activeSpriteId: string
}

export interface CosmoRequest {
  userMessage: string
  projectContext: ProjectContext
  conversationHistory: ChatMessage[]
}

export interface CosmoResponse {
  explanation: string
  proposedBlocks?: ProposedBlockSet
}

export async function askCosmo(request: CosmoRequest): Promise<CosmoResponse> {
  const systemPrompt = buildSystemPrompt()

  const contextBlock = [
    `Current project state:`,
    `Active sprite: "${request.projectContext.activeSpriteName}" (${request.projectContext.activeSpriteId})`,
    `Sprites: ${request.projectContext.sprites.map((s) => `${s.name} (${s.scripts.length} scripts)`).join(', ')}`,
  ].join('\n')

  const messages = [
    ...request.conversationHistory.slice(-10).map((msg) => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content,
    })),
    {
      role: 'user' as const,
      content: `${contextBlock}\n\nKid says: ${request.userMessage}`,
    },
  ]

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const resp = await fetch('/api/ai/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    })

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => 'Unknown error')
      if (resp.status === 429) {
        return { explanation: "Whoa, I'm thinking too fast! Give me a sec and try again. 🧠" }
      }
      throw new Error(`API error ${resp.status}: ${errorText}`)
    }

    const data = await resp.json()
    const textBlock = data.content?.find((c: { type: string }) => c.type === 'text')
    const rawText = textBlock?.text ?? ''

    if (!rawText) {
      return { explanation: "Hmm, I got confused there. Could you ask me again? 🤔" }
    }

    return parseCosmoResponse(rawText)
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return { explanation: "Sorry, that took too long! Try asking something simpler. ⏱️" }
    }
    console.error('Cosmo API error:', err)
    return { explanation: "Oops, my brain glitched! Try again? 🔧" }
  } finally {
    clearTimeout(timeout)
  }
}
