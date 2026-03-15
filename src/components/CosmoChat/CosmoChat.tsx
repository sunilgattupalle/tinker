import { useState, useRef, useEffect, useCallback } from "react";
import { useUIStore } from "@/store/ui";
import { useProjectStore, generateId } from "@/store/project";
import { askCosmo } from "@/ai/client";
import { buildProjectContext } from "@/ai/context";
import { C_SHAPED_BLOCKS } from "@/blocks/definitions";
import { getBlockDefinition } from "@/blocks/registry";
import { BlockPreview } from "./BlockPreview";
import type { ChatMessage, BlockInstance, ProposedBlock, CosmoResponse } from "@/types";

export function CosmoChat() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMessages = useUIStore((s) => s.chatMessages);
  const addChatMessage = useUIStore((s) => s.addChatMessage);
  const markProposalAccepted = useUIStore((s) => s.markProposalAccepted);
  const isCosmoThinking = useUIStore((s) => s.isCosmoThinking);
  const setCosmoThinking = useUIStore((s) => s.setCosmoThinking);

  const addScript = useProjectStore((s) => s.addScript);
  const addBlock = useProjectStore((s) => s.addBlock);
  const addBlockToBody = useProjectStore((s) => s.addBlockToBody);

  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isCosmoThinking]);

  const acceptProposal = useCallback(
    (blocks: ProposedBlock[], msgIndex: number) => {
      applyProposedBlocks(blocks, addScript, addBlock, addBlockToBody);
      markProposalAccepted(msgIndex);
      addChatMessage({
        role: "cosmo",
        content: "Done! Click the green flag to try it out 🟢",
      });
    },
    [addScript, addBlock, addBlockToBody, markProposalAccepted, addChatMessage],
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isCosmoThinking) return;

    setInput("");
    addChatMessage({ role: "user", content: text });
    setCosmoThinking(true);

    try {
      const project = useProjectStore.getState().project;
      const response = await askCosmo({
        userMessage: text,
        projectContext: buildProjectContext(project),
        conversationHistory: useUIStore.getState().chatMessages,
      });

      const cosmoMsg: ChatMessage = {
        role: "cosmo",
        content: response.explanation,
        proposedBlocks:
          response.proposedBlocks.length > 0
            ? response.proposedBlocks
            : undefined,
      };
      addChatMessage(cosmoMsg);
    } catch {
      addChatMessage({
        role: "cosmo",
        content: "Oops, my brain glitched! Try again?",
      });
    } finally {
      setCosmoThinking(false);
    }
  }, [input, isCosmoThinking, addChatMessage, setCosmoThinking]);

  const handleRetry = useCallback(
    async (originalUserMsg: string) => {
      setCosmoThinking(true);
      addChatMessage({
        role: "user",
        content: `Try something different for: "${originalUserMsg}"`,
      });

      try {
        const project = useProjectStore.getState().project;
        const response: CosmoResponse = await askCosmo({
          userMessage: `The user wants a different approach. Original request: "${originalUserMsg}". Try a different combination of blocks.`,
          projectContext: buildProjectContext(project),
          conversationHistory: useUIStore.getState().chatMessages,
        });

        addChatMessage({
          role: "cosmo",
          content: response.explanation,
          proposedBlocks:
            response.proposedBlocks.length > 0
              ? response.proposedBlocks
              : undefined,
        });
      } catch {
        addChatMessage({
          role: "cosmo",
          content: "Oops, my brain glitched! Try again?",
        });
      } finally {
        setCosmoThinking(false);
      }
    },
    [addChatMessage, setCosmoThinking],
  );

  const lastUserMessage = [...chatMessages]
    .reverse()
    .find((m) => m.role === "user")?.content ?? "";

  return (
    <footer className="flex h-chatbar-h shrink-0 items-stretch border-t border-panel-border bg-panel-bg">
      <div className="flex w-14 shrink-0 items-center justify-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-cosmo font-display text-lg font-bold text-white transition-transform ${
            isCosmoThinking ? "animate-pulse" : ""
          }`}
        >
          C
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto py-2 pr-2">
        <div className="flex flex-col gap-2">
          {chatMessages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              index={i}
              onAccept={acceptProposal}
              onRetry={() => handleRetry(lastUserMessage)}
            />
          ))}

          {isCosmoThinking && (
            <div className="max-w-prose rounded-lg bg-app-bg px-3 py-2 font-display text-sm text-text-secondary">
              <span className="inline-flex gap-1">
                Cosmo is thinking
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex w-72 shrink-0 items-center gap-2 px-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Ask Cosmo anything..."
          aria-label="Chat input"
          disabled={isCosmoThinking}
          className="flex-1 rounded-input border border-panel-border px-3 py-2 font-ui text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent disabled:opacity-50"
        />
        <button
          aria-label="Send message"
          onClick={handleSend}
          disabled={isCosmoThinking || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-button bg-cosmo text-white transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          <span className="text-base">↑</span>
        </button>
      </div>
    </footer>
  );
}

function MessageBubble({
  message,
  index,
  onAccept,
  onRetry,
}: {
  message: ChatMessage;
  index: number;
  onAccept: (blocks: ProposedBlock[], index: number) => void;
  onRetry: () => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-prose rounded-lg bg-accent/10 px-3 py-2 font-ui text-sm text-text-primary">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-prose">
      <div className="rounded-lg bg-app-bg px-3 py-2 font-display text-sm text-text-primary">
        {message.content}

        {message.proposedBlocks && message.proposedBlocks.length > 0 && (
          <>
            <BlockPreview blocks={message.proposedBlocks} />
            {!message.accepted && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => onAccept(message.proposedBlocks!, index)}
                  className="rounded-button bg-success px-3 py-1 font-ui text-xs font-medium text-white transition-opacity hover:opacity-80"
                >
                  Accept ✓
                </button>
                <button
                  onClick={onRetry}
                  className="rounded-button border border-panel-border px-3 py-1 font-ui text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
                >
                  Try something else ↻
                </button>
              </div>
            )}
            {message.accepted && (
              <div className="mt-1 font-ui text-xs text-success">
                ✓ Added to canvas
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function applyProposedBlocks(
  proposedBlocks: ProposedBlock[],
  addScript: (hatBlock: BlockInstance) => void,
  addBlock: (block: BlockInstance, scriptId: string, afterBlockId: string | null) => void,
  addBlockToBody: (block: BlockInstance, scriptId: string, parentBlockId: string) => void,
): void {
  if (proposedBlocks.length === 0) return;

  const first = proposedBlocks[0];
  const firstDef = getBlockDefinition(first.definitionId);
  if (!firstDef) return;

  const hatBlock = createInstance(first);

  if (firstDef.shape === "hat") {
    addScript(hatBlock);
  } else {
    addScript(hatBlock);
  }

  const sprite = useProjectStore.getState().getActiveSprite();
  if (!sprite) return;
  const script = sprite.scripts[sprite.scripts.length - 1];
  if (!script) return;

  let prevBlockId = hatBlock.id;
  const cShapeStack: string[] = [];

  for (let i = 1; i < proposedBlocks.length; i++) {
    const proposed = proposedBlocks[i];
    const def = getBlockDefinition(proposed.definitionId);
    if (!def) continue;

    const prevDef = getBlockDefinition(proposedBlocks[i - 1].definitionId);
    const prevIsCShape = prevDef && C_SHAPED_BLOCKS.has(prevDef.id);

    const block = createInstance(proposed);

    if (prevIsCShape) {
      cShapeStack.push(prevBlockId);
      addBlockToBody(block, script.id, prevBlockId);
    } else if (cShapeStack.length > 0 && !C_SHAPED_BLOCKS.has(def.id)) {
      addBlock(block, script.id, prevBlockId);
    } else {
      const attachTo = cShapeStack.length > 0 ? cShapeStack.pop()! : prevBlockId;
      addBlock(block, script.id, attachTo);
    }

    prevBlockId = block.id;
  }
}

function createInstance(proposed: ProposedBlock): BlockInstance {
  return {
    id: generateId(),
    definitionId: proposed.definitionId,
    args: { ...proposed.args },
    next: null,
    parent: null,
    ...(C_SHAPED_BLOCKS.has(proposed.definitionId) ? { branch: {} } : {}),
  };
}
