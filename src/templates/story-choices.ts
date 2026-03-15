import type { Project } from "@/types";
import { resetCounter, buildScript, buildSprite, buildProject } from "./builder";

export function createStoryChoicesTemplate(): Project {
  resetCounter();

  const intro = buildScript([
    { defId: "events_flag" },
    { defId: "looks_say_for", args: { MESSAGE: "You find a mysterious door...", SECONDS: 3 } },
    { defId: "control_wait", args: { SECONDS: 1 } },
    { defId: "looks_say_for", args: { MESSAGE: "Press 'o' to open it, or 'r' to run away", SECONDS: 4 } },
  ]);

  const openDoor = buildScript([
    { defId: "events_key", args: { KEY: "o" } },
    { defId: "looks_say_for", args: { MESSAGE: "Inside you find a treasure! 💎", SECONDS: 3 } },
    { defId: "looks_set_size", args: { PERCENT: 150 } },
  ]);

  const runAway = buildScript([
    { defId: "events_key", args: { KEY: "r" } },
    { defId: "looks_say_for", args: { MESSAGE: "You ran home safely!", SECONDS: 3 } },
    { defId: "motion_goto_xy", args: { X: -200, Y: 0 } },
  ]);

  const character = buildSprite("Character", [intro, openDoor, runAway]);

  return buildProject("Story with Choices", [character]);
}

export const STORY_CHOICES_INFO = {
  id: "story-choices",
  name: "Story with Choices",
  description: "An interactive story where your choices change what happens!",
  icon: "📖",
  cosmoGreeting: "Awesome! This is an interactive story. Click the green flag to start, then make choices with your keyboard. Try adding new story branches! ✨",
};
