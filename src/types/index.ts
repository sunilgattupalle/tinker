export type BlockCategory =
  | "motion"
  | "looks"
  | "sound"
  | "events"
  | "control"
  | "sensing"
  | "operators"
  | "variables";

export type BlockShape = "stack" | "hat" | "cap" | "reporter" | "boolean";

export interface BlockInput {
  name: string;
  type: "number" | "string" | "dropdown" | "boolean";
  default: string | number | boolean;
  options?: string[];
}

export interface BlockDefinition {
  id: string;
  category: BlockCategory;
  label: string;
  color: string;
  shape: BlockShape;
  inputs: BlockInput[];
}

export interface BlockInstance {
  id: string;
  definitionId: string;
  args: Record<string, string | number | boolean>;
  next: string | null;
  parent: string | null;
  branch?: Record<string, string>;
}

export interface Script {
  id: string;
  hatBlockId: string;
  blocks: Record<string, BlockInstance>;
}

export interface Costume {
  name: string;
  url: string;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface Sprite {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: number;
  size: number;
  visible: boolean;
  costumes: Costume[];
  currentCostumeIndex: number;
  scripts: Script[];
  rotationStyle: "all_around" | "left_right" | "dont_rotate";
}

export interface StageConfig {
  width: 480;
  height: 360;
  backdrop: string;
}

export interface Project {
  name: string;
  sprites: Sprite[];
  stage: StageConfig;
  activeSpriteId: string;
}

export interface ProjectContext {
  sprites: Array<{
    name: string;
    scripts: Script[];
  }>;
  activeSpriteId: string;
  availableBlocks: string[];
}

export interface ProposedBlock {
  definitionId: string;
  args: Record<string, string | number | boolean>;
  position: number;
}

export interface ChatMessage {
  role: "user" | "cosmo";
  content: string;
  proposedBlocks?: ProposedBlock[];
  accepted?: boolean;
}

export interface CosmoRequest {
  userMessage: string;
  projectContext: ProjectContext;
  conversationHistory: ChatMessage[];
}

export interface CosmoResponse {
  explanation: string;
  proposedBlocks: ProposedBlock[];
  targetSpriteId: string;
  action: "add_script" | "modify_script" | "add_blocks";
}

export interface InterpreterContext {
  sprite: Sprite;
  allSprites: Sprite[];
  stage: StageConfig;
  stopRequested: boolean;
}

export interface SharedProject {
  version: 1;
  name: string;
  author?: string;
  description?: string;
  createdAt: string;
  project: Project;
  thumbnail?: string;
}
