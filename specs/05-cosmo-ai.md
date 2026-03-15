# Spec 05 — Cosmo AI Integration

**Depends on:** 03-block-system, 04-sprite-stage
**Outcome:** Kids type natural language in the chat bar, Cosmo (powered by Claude) responds with block proposals using scratch-vm opcodes, and accepted proposals appear on the script canvas as working blocks.

---

## What to Build

The AI layer — the thing that makes Tinker different from Scratch. Cosmo takes a kid's plain-English instruction, generates scratch-vm-compatible blocks, and proposes them. The kid reviews and accepts. The accepted blocks are real scratch-vm blocks that execute when the green flag is clicked.

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
  2. A JSON block proposal using scratch-vm opcodes
- Only use opcodes that exist in the opcode registry (provide the full opcode list in the prompt)
- Consider the current project state (what scripts already exist on which sprites)
- For ambiguous requests, ask a clarifying question instead of guessing

Output format spec for Claude — using scratch-vm opcodes:
```json
{
  "explanation": "Cool! I added blocks to make your cat walk forward when you click the green flag 🐱",
  "action": "add_script",
  "targetSprite": "Sprite1",
  "blocks": [
    { "opcode": "event_whenflagclicked" },
    { "opcode": "control_forever", "children": {
      "SUBSTACK": [
        { "opcode": "motion_movesteps", "inputs": { "STEPS": 10 } },
        { "opcode": "control_wait", "inputs": { "DURATION": 0.1 } }
      ]
    }}
  ]
}
```

The prompt must include the full list of supported opcodes with their input/field names, sourced from `src/scratch/opcodes.ts`.

### 3. Response parser

Create `src/ai/parser.ts`:
- `parseAIResponse(raw: string): CosmoResponse`
- Extract JSON from Claude's response (may be wrapped in markdown code fences)
- Validate every `opcode` against the opcode registry (`opcodeRegistry.isValidOpcode()`)
- Validate that input/field names match the opcode spec
- Convert the simplified proposal format into `blockAdapter.createBlock()` calls
- If parsing fails, return a friendly error message for Cosmo to display

### 4. Block proposal → VM blocks

Create a function that converts an accepted proposal into real scratch-vm blocks:
- Walk the proposal's block tree
- For each block: call `blockAdapter.createBlock()` to create it in the VM
- Connect blocks in sequence: call `blockAdapter.connectBlocks()` for next/parent links
- Handle nested blocks: connect children into SUBSTACK inputs
- Position the new script on the canvas (find empty space)

### 5. Cosmo Chat Bar (real content)

Update `src/components/CosmoChat/CosmoChat.tsx`:
- **Input field:** Text input at the bottom, Enter to send, disabled while Cosmo is thinking
- **Message list:** Scrollable area showing conversation history
  - User messages: right-aligned, simple text bubbles
  - Cosmo messages: left-aligned, with Cosmo avatar, text + optional block preview
- **Block preview:** When Cosmo proposes blocks, show them as a miniature read-only block stack within the chat message (reuse the Block component from spec 03)
- **Action buttons:** Below a proposal: [Accept ✓] and [Try something else ↻]
  - Accept: converts proposal to VM blocks via the function from task 4
  - Try something else: sends a follow-up to Claude asking for an alternative
- **Loading state:** While waiting for Claude, show "Cosmo is thinking..." with animated dots
- **Error state:** If the API fails, Cosmo says "Oops, my brain glitched! Try again?"

### 6. Project context builder

Create a function that serializes the current project state for the AI prompt:
- List all sprites with their names and IDs
- For the active sprite: summarize existing scripts (top block opcode + block count)
- The opcode vocabulary from the registry
- Keep it compact — under ~2000 tokens to leave room for conversation

Read project state from the VM: `vm.runtime.targets`, `target.blocks.getScripts()`, etc.

### 7. Conversation management

- Store chat history in the `ui` store
- Send the last 10 messages as conversation context to Claude
- Clear conversation when a new project is loaded
- Persist conversation within a session (not across page reloads for MVP)

### 8. Accept flow animation

When the kid clicks "Accept" on a proposal:
- Blocks animate from the chat bar up to the script canvas (CSS transition or spring animation)
- The new script appears on the canvas, briefly highlighted
- Cosmo shows a celebratory message: "Done! Click the green flag to try it out 🟢"
- The accepted proposal is marked as such in the chat history (can't re-accept)

### 9. Progressive scaffolding (stretch)

Track the kid's experience level based on interactions:
- **Beginner** (first 5 interactions): Cosmo explains every block in the proposal
- **Intermediate** (5-20 interactions): Cosmo gives shorter explanations
- **Advanced** (20+ interactions): Cosmo focuses on the "why" not the "what"

Stretch goal — implement beginner level first.

---

## Acceptance Criteria

- [ ] Typing a message and pressing Enter sends it to Claude via proxy
- [ ] Cosmo responds with an explanation and block proposals using scratch-vm opcodes
- [ ] Block proposals render as a visual preview in the chat
- [ ] Clicking "Accept" creates real scratch-vm blocks on the active sprite
- [ ] Accepted blocks are executable — green flag runs them
- [ ] Clicking "Try something else" asks Claude for an alternative
- [ ] Cosmo's loading state shows while waiting for a response
- [ ] API errors show a friendly message (not a crash)
- [ ] Conversation history is maintained within the session
- [ ] Cosmo's tone matches the spec: enthusiastic, concise, not condescending
- [ ] "make the cat move when I press space" produces working `event_whenkeypressed` + `motion_movesteps` blocks
- [ ] The proxy correctly hides the API key from the frontend
