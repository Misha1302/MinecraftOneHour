const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const WORLD_W = 28;
const WORLD_H = 12;
const WORLD_D = 28;
const WORLD_STORAGE_KEY = "minicraft_world";
const SAVE_VERSION = 2;

const BLOCK_AIR = 0;
const BLOCK_GRASS = 1;
const BLOCK_DIRT = 2;
const BLOCK_STONE = 3;
const BLOCK_WOOD = 4;
const BLOCK_LEAVES = 5;
const BLOCK_SAND = 6;

const BLOCK_NAMES = {
  [BLOCK_GRASS]: "grass",
  [BLOCK_DIRT]: "dirt",
  [BLOCK_STONE]: "stone",
  [BLOCK_WOOD]: "wood",
  [BLOCK_LEAVES]: "leaves",
  [BLOCK_SAND]: "sand"
};

const BLOCK_COLORS = {
  [BLOCK_GRASS]: {
    top: "#61c449",
    left: "#3f8f36",
    right: "#2f742b"
  },
  [BLOCK_DIRT]: {
    top: "#9a6a3a",
    left: "#76502f",
    right: "#5f3f27"
  },
  [BLOCK_STONE]: {
    top: "#9ea4a8",
    left: "#767d82",
    right: "#61686e"
  },
  [BLOCK_WOOD]: {
    top: "#b98547",
    left: "#7b4f2b",
    right: "#643d22"
  },
  [BLOCK_LEAVES]: {
    top: "#4fbf5c",
    left: "#33873d",
    right: "#286f33"
  },
  [BLOCK_SAND]: {
    top: "#e5d37d",
    left: "#c6ad5c",
    right: "#ad9650"
  }
};

let world = [];
const player = { x: WORLD_W / 2, y: WORLD_H - 2, z: WORLD_D / 2, speed: 0.08 };
const keys = {};
const hotbarBlocks = [BLOCK_GRASS, BLOCK_DIRT, BLOCK_STONE, BLOCK_WOOD, BLOCK_LEAVES, BLOCK_SAND];
const coordsEl = document.getElementById("coords");
const hotbarEl = document.getElementById("hotbar");
const selectedBlockEl = document.getElementById("selectedBlock");
const memeMessageEl = document.getElementById("memeMessage");
const debugOverlayEl = document.getElementById("debugOverlay");
const chaosFillEl = document.getElementById("chaosFill");
const chaosValueEl = document.getElementById("chaosValue");
const objectivePanelEl = document.getElementById("objectivePanel");
const worldMessageEl = document.getElementById("worldMessage");
let selectedBlockIndex = 0;
let hoveredBlock = null;
let memeMessageTimer = null;
let debugOverlayEnabled = false;
let frameCount = 0;
let fps = 0;
let fpsLastTime = performance.now();
let worldAnger = 0;
const maxWorldAnger = 100;
let worldPhase = 0;
let collectedCores = 0;
const totalCores = 3;
const activeEffects = {};
let messageText = "";
let messageTimer = 0;
let objectiveText = "Find anomaly cores";
const worldPhrases = [
  "The grass whispers: press F again.",
  "Stone says you are definitely speedrunning.",
  "Tree AI requests more sunlight and snacks.",
  "Sandbox core online. Absolutely stable. Probably.",
  "Local chicken not found. Proceeding anyway."
];

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

  if (e.key.toLowerCase() === "r") {
    generateWorld();
    saveWorld();
    updateHoveredBlock();
  }

  if (e.key.toLowerCase() === "f") {
    showWorldPhrase();
  }

  if (e.key === "`") {
    debugOverlayEnabled = !debugOverlayEnabled;
    updateDebugOverlay();
  }

  const n = Number(e.key);
  if (n >= 1 && n <= hotbarBlocks.length) {
    selectedBlockIndex = n - 1;
    updateHotbar();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

function createEmptyWorld() {
  world = [];

  for (let x = 0; x < WORLD_W; x += 1) {
    world[x] = [];

    for (let y = 0; y < WORLD_H; y += 1) {
      world[x][y] = [];

      for (let z = 0; z < WORLD_D; z += 1) {
        world[x][y][z] = BLOCK_AIR;
      }
    }
  }
}

function inBounds(x, y, z) {
  return x >= 0 && x < WORLD_W && y >= 0 && y < WORLD_H && z >= 0 && z < WORLD_D;
}

function getBlock(x, y, z) {
  if (!inBounds(x, y, z)) {
    return BLOCK_AIR;
  }

  return world[x][y][z];
}

function setBlock(x, y, z, value) {
  if (!inBounds(x, y, z)) {
    return;
  }

  world[x][y][z] = value;
}

function getTopHeight(x, z) {
  for (let y = WORLD_H - 1; y >= 0; y -= 1) {
    if (getBlock(x, y, z) !== BLOCK_AIR) {
      return y;
    }
  }

  return -1;
}

function placeTree(x, z) {
  const groundY = getTopHeight(x, z);
  const trunkBaseY = groundY + 1;
  const leafBaseY = trunkBaseY + 2;

  if (groundY < 0 || trunkBaseY + 2 >= WORLD_H) {
    return;
  }

  for (let leafX = x - 1; leafX <= x + 1; leafX += 1) {
    for (let leafZ = z - 1; leafZ <= z + 1; leafZ += 1) {
      setBlock(leafX, leafBaseY, leafZ, BLOCK_LEAVES);
    }
  }

  setBlock(x, leafBaseY + 1, z, BLOCK_LEAVES);

  for (let y = trunkBaseY; y < trunkBaseY + 3; y += 1) {
    setBlock(x, y, z, BLOCK_WOOD);
  }
}

function generateWorld() {
  createEmptyWorld();

  for (let x = 0; x < WORLD_W; x += 1) {
    for (let z = 0; z < WORLD_D; z += 1) {
      const waveHeight = Math.floor(
        4
        + Math.sin(x * 0.38) * 2.1
        + Math.cos(z * 0.32) * 1.8
        + Math.sin((x + z) * 0.18) * 1.1
      );
      const height = Math.max(1, Math.min(WORLD_H - 2, waveHeight));
      const isBeach = z < 4 || x > WORLD_W - 5;
      const isAnomalyPatch = (x * 17 + z * 31) % 97 === 0;
      const topBlock = isBeach ? BLOCK_SAND : isAnomalyPatch ? BLOCK_STONE : BLOCK_GRASS;

      for (let y = 0; y <= height; y += 1) {
        if (y === height) {
          setBlock(x, y, z, topBlock);
        } else if (height - y <= 2) {
          setBlock(x, y, z, BLOCK_DIRT);
        } else {
          setBlock(x, y, z, BLOCK_STONE);
        }
      }
    }
  }

  const treePositions = [
    [4, 5],
    [7, 18],
    [12, 9],
    [15, 22],
    [20, 6],
    [23, 16],
    [10, 25],
    [25, 24]
  ];

  for (const [x, z] of treePositions) {
    placeTree(x, z);
  }
}

function saveWorld() {
  localStorage.setItem(WORLD_STORAGE_KEY, JSON.stringify({
    version: SAVE_VERSION,
    width: WORLD_W,
    height: WORLD_H,
    depth: WORLD_D,
    blocks: world
  }));
}

function loadWorld() {
  const storedWorld = localStorage.getItem(WORLD_STORAGE_KEY);

  if (storedWorld === null) {
    return false;
  }

  try {
    const save = JSON.parse(storedWorld);

    if (Array.isArray(save)) {
      return false;
    }

    if (
      save.version !== SAVE_VERSION
      || save.width !== WORLD_W
      || save.height !== WORLD_H
      || save.depth !== WORLD_D
      || !Array.isArray(save.blocks)
    ) {
      return false;
    }

    world = save.blocks;
    return true;
  } catch {
    return false;
  }
}

const TILE_W = 48;
const TILE_H = 24;
const BLOCK_H = 24;

function worldToScreen(x, y, z) {
  const sx = (x - z) * (TILE_W / 2);
  const sy = (x + z) * (TILE_H / 2) - y * BLOCK_H;
  const playerSx = (player.x - player.z) * (TILE_W / 2);
  const playerSy = (player.x + player.z) * (TILE_H / 2) - player.y * BLOCK_H;

  return {
    x: canvas.width / 2 + sx - playerSx,
    y: canvas.height / 2 + sy - playerSy
  };
}

function updatePlayer() {
  if (keys["w"]) {
    player.z -= player.speed;
  }
  if (keys["s"]) {
    player.z += player.speed;
  }
  if (keys["a"]) {
    player.x -= player.speed;
  }
  if (keys["d"]) {
    player.x += player.speed;
  }
  if (keys["q"]) {
    player.y += player.speed;
  }
  if (keys["e"]) {
    player.y -= player.speed;
  }

  player.x = Math.max(0, Math.min(WORLD_W - 1, player.x));
  player.z = Math.max(0, Math.min(WORLD_D - 1, player.z));
  player.y = Math.max(0, Math.min(WORLD_H + 2, player.y));
}

function updateUI() {
  coordsEl.textContent = `X: ${player.x.toFixed(1)} Y: ${player.y.toFixed(1)} Z: ${player.z.toFixed(1)}`;
}

function clampWorldAnger() {
  worldAnger = Math.max(0, Math.min(maxWorldAnger, worldAnger));
}

function showWorldMessage(text, duration = 180) {
  messageText = text;
  messageTimer = duration;
  updateChaosUI();
}

function getPhaseForAnger() {
  if (worldAnger >= 75) {
    return 3;
  }

  if (worldAnger >= 45) {
    return 2;
  }

  if (worldAnger >= 20) {
    return 1;
  }

  return 0;
}

function updateWorldPhase() {
  const nextPhase = getPhaseForAnger();

  if (nextPhase === worldPhase) {
    return;
  }

  const previousPhase = worldPhase;
  worldPhase = nextPhase;

  const phaseMessages = [
    "",
    "The world noticed you",
    "Geometry is irritated",
    "The world is no longer pretending"
  ];

  if (worldPhase > previousPhase && phaseMessages[worldPhase]) {
    showWorldMessage(phaseMessages[worldPhase], 210);
  }
}

function addWorldAnger(amount) {
  worldAnger += amount;
  clampWorldAnger();
  updateWorldPhase();
  updateChaosUI();
}

function updateChaosUI() {
  const percent = Math.round((worldAnger / maxWorldAnger) * 100);
  chaosFillEl.style.width = `${percent}%`;
  chaosValueEl.textContent = `${percent}%`;
  objectivePanelEl.textContent = `${objectiveText}: ${collectedCores}/${totalCores}`;

  if (messageTimer > 0 && messageText !== "") {
    worldMessageEl.textContent = messageText;
    worldMessageEl.classList.add("visible");
  } else {
    worldMessageEl.classList.remove("visible");
  }
}

function updateHotbar() {
  hotbarEl.innerHTML = "";

  hotbarBlocks.forEach((blockId, index) => {
    const slot = document.createElement("div");
    slot.className = "hotbar-slot";

    if (index === selectedBlockIndex) {
      slot.classList.add("active");
    }

    slot.textContent = BLOCK_NAMES[blockId];
    hotbarEl.appendChild(slot);
  });

  selectedBlockEl.textContent = `Block: ${BLOCK_NAMES[hotbarBlocks[selectedBlockIndex]]}`;
}

function showWorldPhrase() {
  const index = Math.floor(Math.random() * worldPhrases.length);
  memeMessageEl.textContent = worldPhrases[index];
  memeMessageEl.classList.add("visible");

  if (memeMessageTimer !== null) {
    clearTimeout(memeMessageTimer);
  }

  memeMessageTimer = setTimeout(() => {
    memeMessageEl.classList.remove("visible");
    memeMessageTimer = null;
  }, 2400);
}

function updateDebugOverlay() {
  if (!debugOverlayEnabled) {
    debugOverlayEl.classList.remove("visible");
    return;
  }

  debugOverlayEl.classList.add("visible");
  debugOverlayEl.textContent = [
    "=== FAKE ENGINE TELEMETRY ===",
    `FPS: ${fps}`,
    `World anger: ${worldAnger.toFixed(1)}/${maxWorldAnger}`,
    `Chaos phase: ${worldPhase}`,
    `Chunk mood: ${Math.round((player.x + player.z) * 3) % 7}/6`,
    `Isometric entropy: ${(Math.sin(player.x) * Math.cos(player.z) * 100).toFixed(2)}%`,
    `Hovered block: ${hoveredBlock ? `${hoveredBlock.x},${hoveredBlock.y},${hoveredBlock.z}` : "none"}`,
    "Nanobots in leaves: calibrated"
  ].join("\n");
}

function updateHoveredBlock() {
  let best = null;
  let bestDist = Infinity;

  for (let x = 0; x < WORLD_W; x += 1) {
    for (let y = 0; y < WORLD_H; y += 1) {
      for (let z = 0; z < WORLD_D; z += 1) {
        if (getBlock(x, y, z) === BLOCK_AIR) {
          continue;
        }

        if (getBlock(x, y + 1, z) !== BLOCK_AIR) {
          continue;
        }

        const p = worldToScreen(x, y, z);
        const dx = p.x - canvas.width / 2;
        const dy = p.y - BLOCK_H + TILE_H / 2 - canvas.height / 2;
        const dist = dx * dx + dy * dy;

        if (dist < bestDist) {
          bestDist = dist;
          best = { x, y, z };
        }
      }
    }
  }

  hoveredBlock = bestDist <= 120 * 120 ? best : null;
}

function drawFace(points, color) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.stroke();
}

function drawBlock(x, y, z, blockId) {
  if (blockId === BLOCK_AIR) {
    return;
  }

  const p = worldToScreen(x, y, z);
  const colors = BLOCK_COLORS[blockId];

  const top = [
    { x: p.x, y: p.y - BLOCK_H },
    { x: p.x + TILE_W / 2, y: p.y - BLOCK_H + TILE_H / 2 },
    { x: p.x, y: p.y - BLOCK_H + TILE_H },
    { x: p.x - TILE_W / 2, y: p.y - BLOCK_H + TILE_H / 2 }
  ];
  const left = [
    { x: p.x - TILE_W / 2, y: p.y - BLOCK_H + TILE_H / 2 },
    { x: p.x, y: p.y - BLOCK_H + TILE_H },
    { x: p.x, y: p.y + TILE_H },
    { x: p.x - TILE_W / 2, y: p.y + TILE_H / 2 }
  ];
  const right = [
    { x: p.x + TILE_W / 2, y: p.y - BLOCK_H + TILE_H / 2 },
    { x: p.x, y: p.y - BLOCK_H + TILE_H },
    { x: p.x, y: p.y + TILE_H },
    { x: p.x + TILE_W / 2, y: p.y + TILE_H / 2 }
  ];

  drawFace(left, colors.left);
  drawFace(right, colors.right);
  drawFace(top, colors.top);
}

function drawHoveredOutline() {
  if (hoveredBlock === null) {
    return;
  }

  const p = worldToScreen(hoveredBlock.x, hoveredBlock.y, hoveredBlock.z);
  const top = [
    { x: p.x, y: p.y - BLOCK_H },
    { x: p.x + TILE_W / 2, y: p.y - BLOCK_H + TILE_H / 2 },
    { x: p.x, y: p.y - BLOCK_H + TILE_H },
    { x: p.x - TILE_W / 2, y: p.y - BLOCK_H + TILE_H / 2 }
  ];

  ctx.beginPath();
  ctx.moveTo(top[0].x, top[0].y);
  ctx.lineTo(top[1].x, top[1].y);
  ctx.lineTo(top[2].x, top[2].y);
  ctx.lineTo(top[3].x, top[3].y);
  ctx.closePath();
  ctx.strokeStyle = "#fff7a8";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.lineWidth = 1;
}

function renderWorld() {
  const blocks = [];

  for (let x = 0; x < WORLD_W; x += 1) {
    for (let y = 0; y < WORLD_H; y += 1) {
      for (let z = 0; z < WORLD_D; z += 1) {
        const id = getBlock(x, y, z);

        if (id !== BLOCK_AIR) {
          blocks.push({
            x,
            y,
            z,
            id,
            sort: x + y + z
          });
        }
      }
    }
  }

  blocks.sort((a, b) => a.sort - b.sort);

  for (const block of blocks) {
    drawBlock(block.x, block.y, block.z, block.id);
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#9bddff");
  gradient.addColorStop(1, "#62b8f2");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  renderWorld();
  drawHoveredOutline();
}

function update() {
  updatePlayer();
  if (!keys["w"] && !keys["a"] && !keys["s"] && !keys["d"] && !keys["q"] && !keys["e"]) {
    worldAnger -= 0.015;
    clampWorldAnger();
  }

  if (messageTimer > 0) {
    messageTimer -= 1;
  }

  updateWorldPhase();
  updateHoveredBlock();
  updateUI();
  updateChaosUI();
  updateDebugOverlay();
}

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

canvas.addEventListener("mousedown", (e) => {
  if (hoveredBlock === null) {
    return;
  }

  if (e.button === 0) {
    const brokenBlock = getBlock(hoveredBlock.x, hoveredBlock.y, hoveredBlock.z);
    setBlock(hoveredBlock.x, hoveredBlock.y, hoveredBlock.z, BLOCK_AIR);
    addWorldAnger(brokenBlock === BLOCK_WOOD || brokenBlock === BLOCK_LEAVES ? 2 : 1);
    saveWorld();
  }

  if (e.button === 2) {
    const px = hoveredBlock.x;
    const py = hoveredBlock.y + 1;
    const pz = hoveredBlock.z;

    if (inBounds(px, py, pz) && getBlock(px, py, pz) === BLOCK_AIR) {
      setBlock(px, py, pz, hotbarBlocks[selectedBlockIndex]);
      addWorldAnger(0.5);
      saveWorld();
    }
  }
});

function loop() {
  frameCount += 1;
  const now = performance.now();

  if (now - fpsLastTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    fpsLastTime = now;
  }

  update();
  render();
  requestAnimationFrame(loop);
}

if (!loadWorld()) {
  generateWorld();
  saveWorld();
}

updateHotbar();
updateUI();
updateChaosUI();
loop();
