import type { CosmoRequest, CosmoResponse, ChatMessage } from "@/types";
import { buildSystemPrompt } from "./prompts";
import { parseAIResponse } from "./parser";
import { describeProject } from "./context";
import { useProjectStore } from "@/store/project";

const API_URL = "/api/ai/v1/messages";
const TIMEOUT_MS = 30_000;
const MAX_CONTEXT_MESSAGES = 10;

export async function askCosmo(request: CosmoRequest): Promise<CosmoResponse> {
  const project = useProjectStore.getState().project;
  const systemPrompt = buildSystemPrompt();
  const projectDescription = describeProject(project);

  const messages = buildMessages(
    request.conversationHistory,
    request.userMessage,
  );

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `${systemPrompt}\n\n## Current project state\n${projectDescription}`,
        messages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return {
          explanation: "Whoa, too many requests! Give me a sec and try again 😅",
          proposedBlocks: [],
          targetSpriteId: "",
          action: "add_script",
        };
      }
      return {
        explanation: "Oops, my brain glitched! Try again?",
        proposedBlocks: [],
        targetSpriteId: "",
        action: "add_script",
      };
    }

    const data = await response.json();
    const textContent = data.content?.find(
      (c: { type: string }) => c.type === "text",
    );
    if (!textContent?.text) {
      return {
        explanation: "Hmm, I couldn't figure that out. Try asking in a different way?",
        proposedBlocks: [],
        targetSpriteId: "",
        action: "add_script",
      };
    }

    return parseAIResponse(textContent.text);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        explanation: "I took too long thinking! Try a simpler request?",
        proposedBlocks: [],
        targetSpriteId: "",
        action: "add_script",
      };
    }
    return {
      explanation: "Oops, my brain glitched! Try again?",
      proposedBlocks: [],
      targetSpriteId: "",
      action: "add_script",
    };
  }
}

function buildMessages(
  history: ChatMessage[],
  userMessage: string,
): Array<{ role: string; content: string }> {
  const recent = history.slice(-MAX_CONTEXT_MESSAGES);
  const messages: Array<{ role: string; content: string }> = [];

  for (const msg of recent) {
    messages.push({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    });
  }

  messages.push({ role: "user", content: userMessage });
  return messages;
}
