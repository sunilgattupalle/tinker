import { create } from "zustand";
import type { BlockCategory, ChatMessage, ProposedBlock } from "@/types";

interface UIStoreState {
  selectedCategory: BlockCategory;
  setSelectedCategory: (category: BlockCategory) => void;

  expandedCategories: Set<BlockCategory>;
  toggleCategory: (category: BlockCategory) => void;

  draggingBlockDefId: string | null;
  setDraggingBlockDefId: (id: string | null) => void;

  contextMenu: { x: number; y: number; blockId: string; scriptId: string } | null;
  openContextMenu: (x: number, y: number, blockId: string, scriptId: string) => void;
  closeContextMenu: () => void;

  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  markProposalAccepted: (index: number) => void;
  clearChat: () => void;

  isCosmoThinking: boolean;
  setCosmoThinking: (thinking: boolean) => void;
}

const ALL_CATEGORIES: BlockCategory[] = [
  "motion", "looks", "sound", "events", "control", "sensing", "operators",
];

const WELCOME_MESSAGE: ChatMessage = {
  role: "cosmo",
  content: "Hi! I'm Cosmo 🤖 Tell me what you want to build and I'll help you make it!",
};

export const useUIStore = create<UIStoreState>((set) => ({
  selectedCategory: "motion",
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  expandedCategories: new Set<BlockCategory>(ALL_CATEGORIES),
  toggleCategory: (category) =>
    set((state) => {
      const next = new Set(state.expandedCategories);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return { expandedCategories: next };
    }),

  draggingBlockDefId: null,
  setDraggingBlockDefId: (id) => set({ draggingBlockDefId: id }),

  contextMenu: null,
  openContextMenu: (x, y, blockId, scriptId) =>
    set({ contextMenu: { x, y, blockId, scriptId } }),
  closeContextMenu: () => set({ contextMenu: null }),

  chatMessages: [WELCOME_MESSAGE],
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  markProposalAccepted: (index) =>
    set((state) => ({
      chatMessages: state.chatMessages.map((msg, i) =>
        i === index ? { ...msg, accepted: true } : msg,
      ),
    })),
  clearChat: () => set({ chatMessages: [WELCOME_MESSAGE] }),

  isCosmoThinking: false,
  setCosmoThinking: (thinking) => set({ isCosmoThinking: thinking }),
}));

export type { ProposedBlock };
