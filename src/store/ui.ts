import { create } from 'zustand'
import type { ChatMessage, ProposedBlockSet } from '@/types'

export interface UIStore {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  chatMessages: ChatMessage[]
  isCosmoThinking: boolean
  addUserMessage: (content: string) => void
  addCosmoMessage: (content: string, proposedBlocks?: ProposedBlockSet) => void
  markAccepted: (messageId: string) => void
  setCosmoThinking: (thinking: boolean) => void
  activeModal: string | null
  openModal: (modalId: string) => void
  closeModal: () => void
  showWelcome: boolean
  dismissWelcome: () => void
  isPaletteOpen: boolean
  togglePalette: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  selectedCategory: 'events',
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  chatMessages: [],
  isCosmoThinking: false,
  addUserMessage: (content) =>
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        { id: crypto.randomUUID(), role: 'user', content, timestamp: Date.now() },
      ],
    })),
  addCosmoMessage: (content, proposedBlocks) =>
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        { id: crypto.randomUUID(), role: 'cosmo', content, proposedBlocks, timestamp: Date.now() },
      ],
    })),
  markAccepted: (messageId) =>
    set((state) => ({
      chatMessages: state.chatMessages.map((message) =>
        message.id === messageId ? { ...message, accepted: true } : message,
      ),
    })),
  setCosmoThinking: (isCosmoThinking) => set({ isCosmoThinking }),
  activeModal: null,
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
  showWelcome: true,
  dismissWelcome: () => set({ showWelcome: false }),
  isPaletteOpen: true,
  togglePalette: () => set((state) => ({ isPaletteOpen: !state.isPaletteOpen })),
}))
