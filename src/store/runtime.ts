import { create } from "zustand";

interface SpeechBubble {
  text: string;
  expiresAt: number | null;
}

interface RuntimeStoreState {
  isRunning: boolean;
  runningScripts: Set<string>;
  speechBubbles: Map<string, SpeechBubble>;
  pressedKeys: Set<string>;
  stopRequested: boolean;

  startRunning: () => void;
  stopRunning: () => void;
  addRunningScript: (id: string) => void;
  removeRunningScript: (id: string) => void;
  setSpeechBubble: (spriteId: string, text: string, duration: number | null) => void;
  clearSpeechBubble: (spriteId: string) => void;
  setKeyPressed: (key: string, pressed: boolean) => void;
  isKeyPressed: (key: string) => boolean;
  requestStop: () => void;
}

export const useRuntimeStore = create<RuntimeStoreState>((set, get) => ({
  isRunning: false,
  runningScripts: new Set(),
  speechBubbles: new Map(),
  pressedKeys: new Set(),
  stopRequested: false,

  startRunning: () => set({ isRunning: true, stopRequested: false }),

  stopRunning: () =>
    set({
      isRunning: false,
      runningScripts: new Set(),
      stopRequested: true,
    }),

  addRunningScript: (id) =>
    set((state) => {
      const next = new Set(state.runningScripts);
      next.add(id);
      return { runningScripts: next };
    }),

  removeRunningScript: (id) =>
    set((state) => {
      const next = new Set(state.runningScripts);
      next.delete(id);
      const stillRunning = next.size > 0;
      return {
        runningScripts: next,
        isRunning: stillRunning ? state.isRunning : false,
      };
    }),

  setSpeechBubble: (spriteId, text, duration) =>
    set((state) => {
      const next = new Map(state.speechBubbles);
      next.set(spriteId, {
        text,
        expiresAt: duration !== null ? Date.now() + duration * 1000 : null,
      });
      return { speechBubbles: next };
    }),

  clearSpeechBubble: (spriteId) =>
    set((state) => {
      const next = new Map(state.speechBubbles);
      next.delete(spriteId);
      return { speechBubbles: next };
    }),

  setKeyPressed: (key, pressed) =>
    set((state) => {
      const next = new Set(state.pressedKeys);
      if (pressed) next.add(key);
      else next.delete(key);
      return { pressedKeys: next };
    }),

  isKeyPressed: (key) => get().pressedKeys.has(key),

  requestStop: () => set({ stopRequested: true }),
}));
