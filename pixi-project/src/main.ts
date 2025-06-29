import {
  AnimatedSprite,
  Application,
  Assets,
  Container,
  Graphics,
  StrokeInput,
  Texture,
} from "pixi.js";

const rows = 8;
const cols = 12;
const padding = 50; // optional padding around the grid

(async () => {
  const app = new Application();
  await app.init({
    background: "#f8e9e5",
    resizeTo: window,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
  });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // ! ||--------------------------------------------------------------------------------||
  // ! ||                        scaling grid and tiles to screen                        ||
  // ! ||--------------------------------------------------------------------------------||
  const canvasWidth = app.screen.width;
  const canvasHeight = app.screen.height;
  const availableWidth = canvasWidth - padding * 2;
  const availableHeight = canvasHeight - padding * 2;
  const tileWidth = availableWidth / cols;
  const tileHeight = availableHeight / rows;

  const tileSize = Math.floor(
    Math.min(tileWidth, tileHeight) / (window.devicePixelRatio || 1) // Important since pixels can be based on difference things
  );
  const gridWidth = tileSize * cols;
  const gridHeight = tileSize * rows;
  const offsetX = (canvasWidth - gridWidth) / 2;
  const offsetY = (canvasHeight - gridHeight) / 2;

  const gridContainer = new Container();

  app.stage.addChild(gridContainer);

  // ! ||--------------------------------------------------------------------------------||
  // ! ||                                helper functions                                ||
  // ! ||--------------------------------------------------------------------------------||
  function scaleRumiToFit(flip: boolean = false) {
    const bounds = rumi.getLocalBounds();
    const frameWidth = bounds.width;
    const frameHeight = bounds.height;

    const maxWidth = tileSize * 3; // rumis sprite is very wide
    const maxHeight = tileSize * 1.5; // account for height of spritesheet vs visual size

    const scaleX = maxWidth / frameWidth;
    const scaleY = maxHeight / frameHeight;
    const uniformScale = Math.min(scaleX, scaleY);

    rumi.scale.set(flip ? -uniformScale : uniformScale, uniformScale);
  }

  function placeRumiAt(x: number, y: number) {
    const tileCenterX = offsetX + x * tileSize + tileSize / 2;
    const tileCenterY = offsetY + y * tileSize + tileSize / 2;

    rumi.x = tileCenterX;
    rumi.y = tileCenterY;
  }

  function drawGrid() {
    gridContainer.removeChildren();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const box = new Graphics();

        box.rect(0, 0, tileSize, tileSize);
        box.stroke(0xa69aca);

        box.x = offsetX + col * tileSize;
        box.y = offsetY + row * tileSize;
        gridContainer.addChild(box);
      }
    }
  }

  drawGrid();

  await Assets.load("/assets/rumi2.json");

  const idleFrames: Texture[] = getAnimationFrames("Idle", 9);
  const runFrames: Texture[] = getAnimationFrames("Run", 8);
  const slash1Frames: Texture[] = getAnimationFrames("Slash 1", 7);
  const slash2Frames: Texture[] = getAnimationFrames("Slash 2", 5);
  const slamFrames: Texture[] = getAnimationFrames("Slam", 5);
  const spinFrames: Texture[] = getAnimationFrames("Spin Attack", 6);

  const rumi = new AnimatedSprite(idleFrames);

  placeRumiAt(3, 1);
  scaleRumiToFit();
  rumi.anchor.set(0.3);
  rumi.animationSpeed = 0.15;
  rumi.play();

  app.stage.addChild(rumi);

  let currentAnimation = "Idle";
  let isMovingLeft = false;
  let isMovingRight = false;
  let isMovingUp = false;
  let isMovingDown = false;
  let isAttacking = false;

  function playAttack() {
    if (isAttacking) return;
    isAttacking = true;

    const nextAttack = getNextAttack();
    switchAnimation(nextAttack.name, nextAttack.frames);
    rumi.loop = false;

    rumi.onComplete = () => {
      isAttacking = false;
      rumi.loop = true;
      switchAnimation("Idle", idleFrames);
    };

    rumi.play();
  }

  const attacks = [
    { name: "Slash 1", frames: slash1Frames },
    { name: "Slash 2", frames: slash2Frames },
    { name: "Slam", frames: slamFrames },
    { name: "Spin Attack", frames: spinFrames },
  ];

  let currentAttackIndex = 0;

  function getNextAttack() {
    const attack = attacks[currentAttackIndex];
    currentAttackIndex = (currentAttackIndex + 1) % attacks.length;
    return attack;
  }

  function switchAnimation(name: string, frames: Texture[]) {
    if (currentAnimation === name) return;
    rumi.textures = frames;
    rumi.play();
    currentAnimation = name;
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      isMovingRight = true;

      scaleRumiToFit(false);
      switchAnimation("Run", runFrames);
    } else if (e.key === "ArrowLeft") {
      isMovingLeft = true;
      scaleRumiToFit(true);
      switchAnimation("Run", runFrames);
    } else if (e.key === "ArrowUp") {
      isMovingUp = true;
      switchAnimation("Run", runFrames);
    } else if (e.key === "ArrowDown") {
      isMovingDown = true;
      switchAnimation("Run", runFrames);
    } else if (e.key === "x") {
      playAttack();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight") {
      isMovingRight = false;
    } else if (e.key === "ArrowLeft") {
      isMovingLeft = false;
    } else if (e.key === "ArrowUp") {
      isMovingUp = false;
    } else if (e.key === "ArrowDown") {
      isMovingDown = false;
    }

    if (!isMovingLeft && !isMovingRight && !isAttacking) {
      switchAnimation("Idle", idleFrames);
    }
  });

  app.ticker.add((time) => {
    if (isMovingRight) {
      rumi.x += 2 * time.deltaTime;
    } else if (isMovingLeft) {
      rumi.x -= 2 * time.deltaTime;
    } else if (isMovingUp) {
      rumi.y -= 1.5 * time.deltaTime;
    } else if (isMovingDown) {
      rumi.y += 1.5 * time.deltaTime;
    }
  });
})();

function getAnimationFrames(name: string, frameCount: number): Texture[] {
  const frames: Texture[] = [];

  for (let i = 0; i < frameCount; i++) {
    const texture = Texture.from(`rumi${name}${i}.aseprite`);
    texture.source.style.scaleMode = "nearest";
    frames.push(texture);
  }

  return frames;
}
