import type { Project } from "@/types";
import { resetCounter, buildScript, buildSprite, buildProject } from "./builder";

export function createPetSimTemplate(): Project {
  resetCounter();

  const moveRight = buildScript([
    { defId: "events_key", args: { KEY: "right arrow" } },
    { defId: "motion_move", args: { STEPS: 10 } },
  ]);

  const moveLeft = buildScript([
    { defId: "events_key", args: { KEY: "left arrow" } },
    { defId: "motion_move", args: { STEPS: -10 } },
  ]);

  const moveUp = buildScript([
    { defId: "events_key", args: { KEY: "up arrow" } },
    { defId: "motion_set_y", args: { Y: 10 } },
  ]);

  const moveDown = buildScript([
    { defId: "events_key", args: { KEY: "down arrow" } },
    { defId: "motion_set_y", args: { Y: -10 } },
  ]);

  const speak = buildScript([
    { defId: "events_key", args: { KEY: "s" } },
    { defId: "looks_show" },
    { defId: "looks_say_for", args: { MESSAGE: "Meow!", SECONDS: 2 } },
  ]);

  const hide = buildScript([
    { defId: "events_key", args: { KEY: "h" } },
    { defId: "looks_hide" },
  ]);

  const cat = buildSprite("Cat", [moveRight, moveLeft, moveUp, moveDown, speak, hide]);

  return buildProject("Pet Simulator", [cat]);
}

export const PET_SIM_INFO = {
  id: "pet-sim",
  name: "Pet Simulator",
  description: "Move your cat around with arrow keys and teach it tricks!",
  icon: "🐱",
  cosmoGreeting: "Nice pick! This is a pet simulator. Use the arrow keys to move your cat, press 's' to make it meow, and 'h' to hide it. Try adding new tricks! 🐾",
};
