const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const WORLD_W = 16;
const WORLD_H = 8;
const WORLD_D = 16;

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
const player = { x: 8, y: 6, z: 8, speed: 0.08 };
const keys = {};
const hotbarBlocks = [BLOCK_GRASS, BLOCK_DIRT, BLOCK_STONE, BLOCK_WOOD, BLOCK_LEAVES, BLOCK_SAND];
const coordsEl = document.getElementById("coords");
const hotbarEl = document.getElementById("hotbar");
const selectedBlockEl = document.getElementById("selectedBlock");
let selectedBlockIndex = 0;
let hoveredBlock = null;

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

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
      const waveHeight = Math.floor(2 + Math.sin(x * 0.5) * 1.2 + Math.cos(z * 0.45) * 1.2) + 2;
      const height = Math.max(1, Math.min(WORLD_H - 2, waveHeight));
      const topBlock = z < 3 || x > WORLD_W - 4 ? BLOCK_SAND : BLOCK_GRASS;

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

  placeTree(4, 4);
  placeTree(10, 11);
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
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();
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
  ctx.fillStyle = "#79c7ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  renderWorld();
  drawHoveredOutline();
}

function update() {
  updatePlayer();
  updateHoveredBlock();
  updateUI();
}

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

canvas.addEventListener("mousedown", (e) => {
  if (hoveredBlock === null) {
    return;
  }

  if (e.button === 0) {
    setBlock(hoveredBlock.x, hoveredBlock.y, hoveredBlock.z, BLOCK_AIR);
  }

  if (e.button === 2) {
    const px = hoveredBlock.x;
    const py = hoveredBlock.y + 1;
    const pz = hoveredBlock.z;

    if (inBounds(px, py, pz) && getBlock(px, py, pz) === BLOCK_AIR) {
      setBlock(px, py, pz, hotbarBlocks[selectedBlockIndex]);
    }
  }
});

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

generateWorld();
updateUI();
updateHotbar();
loop();
