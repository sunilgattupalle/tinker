import type { Project } from "@/types";
import { resetCounter, buildScript, buildSprite, buildProject } from "./builder";

export function createQuizGameTemplate(): Project {
  resetCounter();

  const askQuestion = buildScript([
    { defId: "events_flag" },
    { defId: "looks_say_for", args: { MESSAGE: "What's 2 + 2?", SECONDS: 5 } },
  ]);

  const correctAnswer = buildScript([
    { defId: "events_key", args: { KEY: "4" } },
    { defId: "looks_say_for", args: { MESSAGE: "Correct! 🎉", SECONDS: 3 } },
  ]);

  const wrongA = buildScript([
    { defId: "events_key", args: { KEY: "1" } },
    { defId: "looks_say_for", args: { MESSAGE: "Try again!", SECONDS: 2 } },
  ]);

  const wrongB = buildScript([
    { defId: "events_key", args: { KEY: "2" } },
    { defId: "looks_say_for", args: { MESSAGE: "Try again!", SECONDS: 2 } },
  ]);

  const wrongC = buildScript([
    { defId: "events_key", args: { KEY: "3" } },
    { defId: "looks_say_for", args: { MESSAGE: "Try again!", SECONDS: 2 } },
  ]);

  const host = buildSprite("QuizHost", [askQuestion, correctAnswer, wrongA, wrongB, wrongC]);

  return buildProject("Quiz Game", [host]);
}

export const QUIZ_GAME_INFO = {
  id: "quiz-game",
  name: "Quiz Game",
  description: "A sprite asks questions and checks your answers!",
  icon: "🧠",
  cosmoGreeting: "Great choice! This is a quiz game. Click the green flag to hear the question, then press the right number key. Try adding more questions! 📝",
};
