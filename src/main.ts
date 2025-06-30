import {
  AnimatedSprite,
  Application,
  Assets,
  Container,
  FederatedPointerEvent,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";

import { Tween, Easing, Group } from "@tweenjs/tween.js";
import { getAnimationFrames } from "./animationHelpers";

const rows = 8;
const cols = 6;
const padding = 0; // optional padding around the grid

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
    Math.min(tileWidth, tileHeight) / (window.devicePixelRatio || 1)
  );
  const gridWidth = tileSize * cols;
  const gridHeight = tileSize * rows;
  const offsetX = (canvasWidth - gridWidth) / 2;
  const offsetY = (canvasHeight - gridHeight) / 2;

  const gridContainer = new Container();

  app.stage.addChild(gridContainer);
  let activeTween: Tween | null = null;

  await placeGrassAndFlowers();
  await Assets.load("/assets/rumi2.json");

  const idleFrames: Texture[] = getAnimationFrames("rumiIdle", 9);
  const runFrames: Texture[] = getAnimationFrames("rumiRun", 8);
  const slash1Frames: Texture[] = getAnimationFrames("rumiSlash 1", 7);
  const slash2Frames: Texture[] = getAnimationFrames("rumiSlash 2", 5);
  const slamFrames: Texture[] = getAnimationFrames("rumiSlam", 5);
  const spinFrames: Texture[] = getAnimationFrames("rumiSpin Attack", 6);

  const rumi = new AnimatedSprite(idleFrames);
  const tweenGroup = new Group();

  let rumiX = 2;
  let rumiY = 3;
  let currentAttackIndex = 0;
  let rumiFlip = false;
  let moved = false; // vibe coded, this i think can be removed when we attack with movement

  rumi.anchor.set(0.3);
  rumi.animationSpeed = 0.15;

  app.stage.addChild(rumi);

  let currentAnimation = "Idle";
  const attacks = [
    { name: "Slash 1", frames: slash1Frames },
    { name: "Slash 2", frames: slash2Frames },
    { name: "Slam", frames: slamFrames },
    { name: "Spin Attack", frames: spinFrames },
  ];

  rumi.play();
  placeRumi();
  scaleRumiToFit();

  // ! ||--------------------------------------------------------------------------------||
  // ! ||                              mobile controls setup                             ||
  // ! ||--------------------------------------------------------------------------------||

  const inputOverlay = new Graphics();
  inputOverlay.rect(0, 0, canvasWidth, canvasHeight);
  inputOverlay.fill({ color: 0x000000, alpha: 0 }); // Fully transparent
  inputOverlay.interactive = true;
  inputOverlay.hitArea = new Rectangle(
    0,
    0,
    app.screen.width,
    app.screen.height
  );

  app.stage.addChild(inputOverlay);

  inputOverlay.on("pointerdown", (event: FederatedPointerEvent) => {
    const x = event.global.x;
    const y = event.global.y;

    // Tweakable thresholds
    const leftThreshold = canvasWidth * 0.4;
    const rightThreshold = canvasWidth * 0.6;
    const topThreshold = canvasHeight * 0.4;
    const bottomThreshold = canvasHeight * 0.6;

    const isLeft = x < leftThreshold;
    const isRight = x > rightThreshold;
    const isTop = y < topThreshold;
    const isBottom = y > bottomThreshold;

    moved = false;

    if (isLeft) {
      handleLeft();
    } else if (isRight) {
      handleRight();
    } else if (isTop) {
      handleUp();
    } else if (isBottom) {
      handleDown();
    } else {
      playAttack();
    }

    if (moved) {
      scaleRumiToFit(rumiFlip); // Flip before moving
      switchRumiAnimation("Run", runFrames);
      moveRumiToGrid(rumiX, rumiY, rumiFlip);
    }
  });

  // ! ||--------------------------------------------------------------------------------||
  // ! ||                                 input handlers                                 ||
  // ! ||--------------------------------------------------------------------------------||
  function handleRight(): void {
    rumiX++;
    rumiFlip = false;
    moved = true;
  }

  function handleLeft(): void {
    rumiX--;
    rumiFlip = true;
    moved = true;
  }

  function handleUp(): void {
    rumiY--;
    moved = true;
  }

  function handleDown(): void {
    rumiY++;
    moved = true;
  }

  // ! ||--------------------------------------------------------------------------------||
  // ! ||                                helper functions                                ||
  // ! ||--------------------------------------------------------------------------------||

  // Hardcoding some grass and flowers as background
  async function placeGrassAndFlowers() {
    const flowerTex = await Assets.load("/assets/flower.png");
    const grass1Tex = await Assets.load("/assets/grass1.png");
    const grass2Tex = await Assets.load("/assets/grass2.png");
    const grass3Tex = await Assets.load("/assets/grass3.png");
    grass3Tex.source.style.scaleMode = "nearest";
    grass2Tex.source.style.scaleMode = "nearest";
    grass1Tex.source.style.scaleMode = "nearest";
    flowerTex.source.style.scaleMode = "nearest";

    const textures = [flowerTex, grass1Tex, grass2Tex, grass3Tex];

    // Helper function to place a sprite at grid position (gx, gy)
    function placeSprite(texture: Texture, gx: number, gy: number) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.x = offsetX + gx * tileSize + tileSize / 2;
      sprite.y = offsetY + gy * tileSize + tileSize / 2;
      sprite.scale.set(0.9); // Scale to fit nicely inside tile
      app.stage.addChild(sprite);
    }

    // Hardcoded positions with random selection of texture
    const placements = [
      // top left
      [0, 0],
      [0, 1],
      [1, 0],
      // bottom right
      [5, 7],
      [5, 6],
      [4, 7],
      // center
      [3, 4],
      [5, 3],
      [2, 3],
      [2, 5],
    ];

    for (const [gx, gy] of placements) {
      const tex = textures[Math.floor(Math.random() * textures.length)];
      placeSprite(tex, gx, gy);
    }
  }

  // Scales her to fit in the grid, also handles mirroring the sprite
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

  // Sets Rumi position to her current x,y
  function placeRumi() {
    const tileCenterX = offsetX + rumiX * tileSize + tileSize / 2;
    const tileCenterY = offsetY + rumiY * tileSize + tileSize / 2;

    rumi.x = tileCenterX;
    rumi.y = tileCenterY;
  }

  // Moves Rumi to new x,y in the grid, with tweening
  function moveRumiToGrid(newX: number, newY: number, flip = false) {
    const targetX = offsetX + newX * tileSize + tileSize / 2;
    const targetY = offsetY + newY * tileSize + tileSize / 2;

    switchRumiAnimation("Run", runFrames);
    scaleRumiToFit(flip);

    const tween = new Tween(rumi, tweenGroup) // pass group as second argument
      .to({ x: targetX, y: targetY }, 500)
      .easing(Easing.Linear.Out)
      .onComplete(() => {
        if (activeTween === tween) {
          switchRumiAnimation("Idle", idleFrames);
        }
      });

    tween.start();
    activeTween = tween;

    rumiX = newX;
    rumiY = newY;
  }

  // For debugging
  // function drawGrid() {
  //   gridContainer.removeChildren();

  //   for (let row = 0; row < rows; row++) {
  //     for (let col = 0; col < cols; col++) {
  //       const box = new Graphics();

  //       box.rect(0, 0, tileSize, tileSize);
  //       box.stroke(0xa69aca);

  //       box.x = offsetX + col * tileSize;
  //       box.y = offsetY + row * tileSize;
  //       gridContainer.addChild(box);
  //     }
  //   }
  // }

  // drawGrid();

  function playAttack() {
    const nextAttack = getNextAttack();
    switchRumiAnimation(nextAttack.name, nextAttack.frames);
    rumi.loop = false;

    rumi.onComplete = () => {
      rumi.loop = true;
      switchRumiAnimation("Idle", idleFrames);
    };

    rumi.play();
  }

  function getNextAttack() {
    const attack = attacks[currentAttackIndex];
    currentAttackIndex = (currentAttackIndex + 1) % attacks.length;
    return attack;
  }

  function switchRumiAnimation(animationName: string, frames: Texture[]) {
    if (currentAnimation === animationName) return;
    rumi.textures = frames;
    rumi.play();
    currentAnimation = animationName;
  }

  window.addEventListener("keydown", (e) => {
    moved = false;
    if (e.key === "ArrowRight") {
      handleRight();
    } else if (e.key === "ArrowLeft") {
      handleLeft();
    } else if (e.key === "ArrowUp") {
      handleUp();
    } else if (e.key === "ArrowDown") {
      handleDown();
    } else if (e.key === "x") {
      playAttack();
    }

    if (moved) {
      scaleRumiToFit(rumiFlip); // Flip before moving
      switchRumiAnimation("Run", runFrames);
      moveRumiToGrid(rumiX, rumiY, rumiFlip);
    }
  });

  app.ticker.add(() => {
    tweenGroup.update(performance.now());
  });
})();
