import { describe, it, expect, beforeEach } from "vitest";
import { useRuntimeStore } from "./runtime";

describe("Runtime Store", () => {
  beforeEach(() => {
    const state = useRuntimeStore.getState();
    state.stopRunning();
    useRuntimeStore.setState({
      speechBubbles: new Map(),
      pressedKeys: new Set(),
      stopRequested: false,
    });
  });

  it("starts in a non-running state", () => {
    expect(useRuntimeStore.getState().isRunning).toBe(false);
  });

  it("starts and stops running", () => {
    useRuntimeStore.getState().startRunning();
    expect(useRuntimeStore.getState().isRunning).toBe(true);

    useRuntimeStore.getState().stopRunning();
    expect(useRuntimeStore.getState().isRunning).toBe(false);
  });

  it("tracks running scripts", () => {
    useRuntimeStore.getState().startRunning();
    useRuntimeStore.getState().addRunningScript("s1");
    useRuntimeStore.getState().addRunningScript("s2");
    expect(useRuntimeStore.getState().runningScripts.size).toBe(2);

    useRuntimeStore.getState().removeRunningScript("s1");
    expect(useRuntimeStore.getState().runningScripts.size).toBe(1);
  });

  it("sets isRunning to false when all scripts finish", () => {
    useRuntimeStore.getState().startRunning();
    useRuntimeStore.getState().addRunningScript("s1");
    useRuntimeStore.getState().removeRunningScript("s1");
    expect(useRuntimeStore.getState().isRunning).toBe(false);
  });

  it("manages speech bubbles", () => {
    useRuntimeStore.getState().setSpeechBubble("sprite1", "Hello!", null);
    const bubbles = useRuntimeStore.getState().speechBubbles;
    expect(bubbles.get("sprite1")?.text).toBe("Hello!");

    useRuntimeStore.getState().clearSpeechBubble("sprite1");
    expect(useRuntimeStore.getState().speechBubbles.has("sprite1")).toBe(false);
  });

  it("tracks key presses", () => {
    useRuntimeStore.getState().setKeyPressed("space", true);
    expect(useRuntimeStore.getState().isKeyPressed("space")).toBe(true);

    useRuntimeStore.getState().setKeyPressed("space", false);
    expect(useRuntimeStore.getState().isKeyPressed("space")).toBe(false);
  });

  it("sets stopRequested on requestStop", () => {
    useRuntimeStore.getState().requestStop();
    expect(useRuntimeStore.getState().stopRequested).toBe(true);
  });
});
