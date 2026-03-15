# Spec 05 — Cosmo AI Integration

**Depends on:** 03-block-system, 04-sprite-stage
**Outcome:** Kids type natural language in the chat bar, Cosmo (powered by Claude) responds with block proposals, and accepted proposals appear on the script canvas.

---

## What to Build

The AI layer — the thing that makes Tinker different from Scratch. Cosmo takes a kid's plain-English instruction, figures out which blocks to use, and proposes them. The kid reviews and accepts.

---

## Tasks

### 1. AI client

Create `src/ai/client.ts`:
- `askCosmo(request: CosmoRequest): Promise<CosmoResponse>`
- Sends a POST request to `/api/ai/v1/messages` (proxied to Claude API)
- Includes the system prompt, conversation history, and project context
- Parses the structured response (expects JSON within Claude's response)
- Handles errors gracefully: network failures, rate limits, malformed responses
- Timeout: 30 seconds max

### 2. System prompt (Cosmo personality)

Create `src/ai/prompts.ts`:

The system prompt should instruct Claude to:
- Respond as Cosmo: enthusiastic, concise, encouraging, never condescending
- Use short sentences. One or two emojis max.
- Always include:
  1. A plain-English explanation of what the blocks do
  2. A JSON block proposal in a specific format
- Only use blocks that exist in the registry (provide the full block list in the prompt)
- Consider the current project state (what scripts already exist)
- For ambiguous requests, ask a clarifying question instead of guessing

Output format spec for Claude:
```json
{
  "explanation": "Cool! I added blocks to make your cat walk forward when you click the green flag 🐱",
  "action": "add_script",
  "targetSprite": "Sprite1",
  "blocks": [
    { "definitionId": "events_flag", "args": {} },
    { "definitionId": "control_forever", "args": {}, "children": [
      { "definitionId": "motion_move", "args": { "STEPS": 10 } },
      { "definitionId": "control_wait", "args": { "SECONDS": 0.1 } }
    ]}
  ]
}
```

### 3. Response parser

Create `src/ai/parser.ts`:
- `parseAIResponse(raw: string): CosmoResponse`
- Extract JSON from Claude's response (may be wrapped in markdown code fences)
- Validate that all `definitionId` values exist in the block registry
- Validate that args match the block's input spec
- If parsing fails, return a friendly error message for Cosmo to display

### 4. Cosmo Chat Bar (real content)

Update `src/components/CosmoChat/CosmoChat.tsx`:
- **Input field:** Text input at the bottom, Enter to send, disabled while Cosmo is thinking
- **Message list:** Scrollable area showing conversation history
  - User messages: right-aligned, simple text bubbles
  - Cosmo messages: left-aligned, with Cosmo avatar, text + optional block preview
- **Block preview:** When Cosmo proposes blocks, show them as a miniature read-only block stack within the chat message
- **Action buttons:** Below a proposal: [Accept ✓] and [Try something else ↻]
  - Accept: adds the blocks to the active sprite's scripts on the canvas
  - Try something else: sends a follow-up to Claude asking for an alternative
- **Loading state:** While waiting for Claude, show Cosmo with "thinking" animation (three dots or spinning indicator) and "Cosmo is thinking..." text
- **Error state:** If the API fails, Cosmo says "Oops, my brain glitched! Try again?"

### 5. Project context builder

Create a function that serializes the current project state into a compact format for the AI prompt:
- List all sprites with their names
- For the active sprite: list all current scripts as human-readable descriptions
- List all available block IDs grouped by category
- Keep it under ~2000 tokens to leave room for conversation

### 6. Conversation management

- Store chat history in the `ui` store
- Send the last 10 messages as conversation context to Claude
- Clear conversation when the project is reset
- Persist conversation within a session (not across page reloads for MVP)

### 7. Accept flow animation

When the kid clicks "Accept" on a proposal:
- Blocks animate from the chat bar up to the script canvas (CSS transition or spring animation)
- The new script appears on the canvas, briefly highlighted
- Cosmo shows a celebratory message: "Done! Click the green flag to try it out 🟢"
- The accepted proposal is marked as such in the chat history (can't re-accept)

### 8. Progressive scaffolding (stretch)

Track the kid's experience level based on interactions:
- **Beginner** (first 5 interactions): Cosmo explains every block in the proposal
- **Intermediate** (5-20 interactions): Cosmo gives shorter explanations
- **Advanced** (20+ interactions): Cosmo focuses on the "why" not the "what"

This is a stretch goal — implement the beginner level first and make the others configurable.

---

## Acceptance Criteria

- [ ] Typing a message and pressing Enter sends it to Claude via proxy
- [ ] Cosmo responds with an explanation and block proposals
- [ ] Block proposals render as a visual preview in the chat
- [ ] Clicking "Accept" adds the proposed blocks to the script canvas
- [ ] Clicking "Try something else" asks Claude for an alternative
- [ ] Cosmo's loading state shows while waiting for a response
- [ ] API errors show a friendly message (not a crash)
- [ ] Conversation history is maintained within the session
- [ ] Cosmo's tone matches the spec: enthusiastic, concise, not condescending
- [ ] "make the cat move when I press space" produces a working script with events_key + motion_move
- [ ] The proxy correctly hides the API key from the frontend
