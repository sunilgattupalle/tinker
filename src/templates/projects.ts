const CAT_COSTUME = {
  name: 'costume1',
  bitmapResolution: 1,
  dataFormat: 'svg',
  assetId: 'bcf454acf82e4504149f7ffe07081dbc',
  md5ext: 'bcf454acf82e4504149f7ffe07081dbc.svg',
  rotationCenterX: 48,
  rotationCenterY: 50,
}

const MEOW_SOUND = {
  name: 'Meow',
  assetId: '83c36d806dc92327b9e7049a565c6bff',
  dataFormat: 'wav',
  md5ext: '83c36d806dc92327b9e7049a565c6bff.wav',
  rate: 22050,
  sampleCount: 18688,
}

const WHITE_BACKDROP = {
  name: 'backdrop1',
  dataFormat: 'svg',
  assetId: 'cd21514d0531fdffb22204e0ec5ed84a',
  md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg',
  rotationCenterX: 240,
  rotationCenterY: 180,
}

const STAGE_BASE = {
  isStage: true,
  name: 'Stage',
  variables: {},
  lists: {},
  broadcasts: {},
  blocks: {},
  comments: {},
  currentCostume: 0,
  costumes: [WHITE_BACKDROP],
  sounds: [],
  volume: 100,
  layerOrder: 0,
  tempo: 60,
  videoTransparency: 50,
  videoState: 'off',
}

function spriteBase(name: string, x = 0, y = 0) {
  return {
    isStage: false,
    name,
    variables: {},
    lists: {},
    broadcasts: {},
    comments: {},
    currentCostume: 0,
    costumes: [CAT_COSTUME],
    sounds: [MEOW_SOUND],
    volume: 100,
    visible: true,
    x,
    y,
    size: 100,
    direction: 90,
    draggable: false,
    rotationStyle: 'all around' as const,
    layerOrder: 1,
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 14)
}

function wrapProject(targets: object[]) {
  return JSON.stringify({
    targets,
    monitors: [],
    extensions: [],
    meta: { semver: '3.0.0', vm: '0.2.0', agent: 'tinker' },
  })
}

function numLiteral(value: number): unknown[] {
  return [1, [4, String(value)]]
}

function strLiteral(value: string): unknown[] {
  return [1, [10, value]]
}

export function blankProject(): string {
  return wrapProject([
    STAGE_BASE,
    { ...spriteBase('Sprite1'), blocks: {} },
  ])
}

export function petSimProject(): string {
  const rightId = uid(), rightMoveId = uid()
  const leftId = uid(), leftMoveId = uid()
  const upId = uid(), upMoveId = uid()
  const downId = uid(), downMoveId = uid()
  const speakId = uid(), speakSayId = uid()

  const blocks: Record<string, object> = {
    [rightId]: {
      opcode: 'event_whenkeypressed', next: rightMoveId, parent: null,
      inputs: {}, fields: { KEY_OPTION: ['right arrow', null] },
      shadow: false, topLevel: true, x: 50, y: 50,
    },
    [rightMoveId]: {
      opcode: 'motion_movesteps', next: null, parent: rightId,
      inputs: { STEPS: numLiteral(10) }, fields: {},
      shadow: false, topLevel: false,
    },
    [leftId]: {
      opcode: 'event_whenkeypressed', next: leftMoveId, parent: null,
      inputs: {}, fields: { KEY_OPTION: ['left arrow', null] },
      shadow: false, topLevel: true, x: 50, y: 200,
    },
    [leftMoveId]: {
      opcode: 'motion_movesteps', next: null, parent: leftId,
      inputs: { STEPS: numLiteral(-10) }, fields: {},
      shadow: false, topLevel: false,
    },
    [upId]: {
      opcode: 'event_whenkeypressed', next: upMoveId, parent: null,
      inputs: {}, fields: { KEY_OPTION: ['up arrow', null] },
      shadow: false, topLevel: true, x: 300, y: 50,
    },
    [upMoveId]: {
      opcode: 'motion_changeyby', next: null, parent: upId,
      inputs: { DY: numLiteral(10) }, fields: {},
      shadow: false, topLevel: false,
    },
    [downId]: {
      opcode: 'event_whenkeypressed', next: downMoveId, parent: null,
      inputs: {}, fields: { KEY_OPTION: ['down arrow', null] },
      shadow: false, topLevel: true, x: 300, y: 200,
    },
    [downMoveId]: {
      opcode: 'motion_changeyby', next: null, parent: downId,
      inputs: { DY: numLiteral(-10) }, fields: {},
      shadow: false, topLevel: false,
    },
    [speakId]: {
      opcode: 'event_whenkeypressed', next: speakSayId, parent: null,
      inputs: {}, fields: { KEY_OPTION: ['s', null] },
      shadow: false, topLevel: true, x: 550, y: 50,
    },
    [speakSayId]: {
      opcode: 'looks_sayforsecs', next: null, parent: speakId,
      inputs: { MESSAGE: strLiteral('Meow!'), SECS: numLiteral(2) }, fields: {},
      shadow: false, topLevel: false,
    },
  }

  return wrapProject([
    STAGE_BASE,
    { ...spriteBase('Cat'), blocks },
  ])
}

export function quizGameProject(): string {
  const flagId = uid(), askId = uid(), waitId = uid()

  const correctKeyId = uid(), correctSayId = uid()
  const wrongKeyId = uid(), wrongSayId = uid()

  const blocks: Record<string, object> = {
    [flagId]: {
      opcode: 'event_whenflagclicked', next: askId, parent: null,
      inputs: {}, fields: {},
      shadow: false, topLevel: true, x: 50, y: 50,
    },
    [askId]: {
      opcode: 'looks_sayforsecs', next: waitId, parent: flagId,
      inputs: { MESSAGE: strLiteral("What's 2 + 2?"), SECS: numLiteral(3) }, fields: {},
      shadow: false, topLevel: false,
    },
    [waitId]: {
      opcode: 'looks_say', next: null, parent: askId,
      inputs: { MESSAGE: strLiteral('Press 4 for the answer!') }, fields: {},
      shadow: false, topLevel: false,
    },
    [correctKeyId]: {
      opcode: 'event_whenkeypressed', next: correctSayId, parent: null,
      inputs: {}, fields: { KEY_OPTION: ['4', null] },
      shadow: false, topLevel: true, x: 350, y: 50,
    },
    [correctSayId]: {
      opcode: 'looks_sayforsecs', next: null, parent: correctKeyId,
      inputs: { MESSAGE: strLiteral('Correct! 🎉'), SECS: numLiteral(2) }, fields: {},
      shadow: false, topLevel: false,
    },
    [wrongKeyId]: {
      opcode: 'event_whenkeypressed', next: wrongSayId, parent: null,
      inputs: {}, fields: { KEY_OPTION: ['3', null] },
      shadow: false, topLevel: true, x: 350, y: 200,
    },
    [wrongSayId]: {
      opcode: 'looks_sayforsecs', next: null, parent: wrongKeyId,
      inputs: { MESSAGE: strLiteral('Try again!'), SECS: numLiteral(2) }, fields: {},
      shadow: false, topLevel: false,
    },
  }

  return wrapProject([
    STAGE_BASE,
    { ...spriteBase('Quiz Host'), blocks },
  ])
}

export function storyChoicesProject(): string {
  const flagId = uid(), intro1Id = uid(), wait1Id = uid(), intro2Id = uid()

  const openKeyId = uid(), openSayId = uid(), openGrowId = uid()
  const runKeyId = uid(), runSayId = uid(), runMoveId = uid()

  const blocks: Record<string, object> = {
    [flagId]: {
      opcode: 'event_whenflagclicked', next: intro1Id, parent: null,
      inputs: {}, fields: {},
      shadow: false, topLevel: true, x: 50, y: 50,
    },
    [intro1Id]: {
      opcode: 'looks_sayforsecs', next: wait1Id, parent: flagId,
      inputs: { MESSAGE: strLiteral('You find a mysterious door...'), SECS: numLiteral(3) }, fields: {},
      shadow: false, topLevel: false,
    },
    [wait1Id]: {
      opcode: 'control_wait', next: intro2Id, parent: intro1Id,
      inputs: { DURATION: numLiteral(1) }, fields: {},
      shadow: false, topLevel: false,
    },
    [intro2Id]: {
      opcode: 'looks_say', next: null, parent: wait1Id,
      inputs: { MESSAGE: strLiteral("Press 'o' to open or 'r' to run!") }, fields: {},
      shadow: false, topLevel: false,
    },
    [openKeyId]: {
      opcode: 'event_whenkeypressed', next: openSayId, parent: null,
      inputs: {}, fields: { KEY_OPTION: ['o', null] },
      shadow: false, topLevel: true, x: 400, y: 50,
    },
    [openSayId]: {
      opcode: 'looks_sayforsecs', next: openGrowId, parent: openKeyId,
      inputs: { MESSAGE: strLiteral('Inside you find treasure! 💎'), SECS: numLiteral(2) }, fields: {},
      shadow: false, topLevel: false,
    },
    [openGrowId]: {
      opcode: 'looks_setsizeto', next: null, parent: openSayId,
      inputs: { SIZE: numLiteral(150) }, fields: {},
      shadow: false, topLevel: false,
    },
    [runKeyId]: {
      opcode: 'event_whenkeypressed', next: runSayId, parent: null,
      inputs: {}, fields: { KEY_OPTION: ['r', null] },
      shadow: false, topLevel: true, x: 400, y: 250,
    },
    [runSayId]: {
      opcode: 'looks_sayforsecs', next: runMoveId, parent: runKeyId,
      inputs: { MESSAGE: strLiteral('You ran home safely!'), SECS: numLiteral(2) }, fields: {},
      shadow: false, topLevel: false,
    },
    [runMoveId]: {
      opcode: 'motion_gotoxy', next: null, parent: runSayId,
      inputs: { X: numLiteral(-200), Y: numLiteral(0) }, fields: {},
      shadow: false, topLevel: false,
    },
  }

  return wrapProject([
    STAGE_BASE,
    { ...spriteBase('Storyteller'), blocks },
  ])
}
