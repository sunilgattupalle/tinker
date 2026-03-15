import type { Project } from "@/types";
import { createPetSimTemplate, PET_SIM_INFO } from "./pet-sim";
import { createQuizGameTemplate, QUIZ_GAME_INFO } from "./quiz-game";
import { createStoryChoicesTemplate, STORY_CHOICES_INFO } from "./story-choices";

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  cosmoGreeting: string;
}

export const TEMPLATES: TemplateInfo[] = [
  PET_SIM_INFO,
  QUIZ_GAME_INFO,
  STORY_CHOICES_INFO,
];

const creators: Record<string, () => Project> = {
  "pet-sim": createPetSimTemplate,
  "quiz-game": createQuizGameTemplate,
  "story-choices": createStoryChoicesTemplate,
};

export function loadTemplate(id: string): Project | null {
  const creator = creators[id];
  return creator ? creator() : null;
}

export function getTemplateInfo(id: string): TemplateInfo | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
