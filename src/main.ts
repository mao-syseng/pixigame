import {
  AnimatedSprite,
  Application,
  Assets,
  Container,
  Texture,
} from "pixi.js";

import { Tween, Easing, Group } from "@tweenjs/tween.js";

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
    Math.min(tileWidth, tileHeight) / (window.devicePixelRatio || 1),
  );
  const gridWidth = tileSize * cols;
  const gridHeight = tileSize * rows;
  const offsetX = (canvasWidth - gridWidth) / 2;
  const offsetY = (canvasHeight - gridHeight) / 2;

  const gridContainer = new Container();

  app.stage.addChild(gridContainer);
  let activeTween: Tween | null = null;

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

  function placeRumiAt() {
    const tileCenterX = offsetX + rumiX * tileSize + tileSize / 2;
    const tileCenterY = offsetY + rumiY * tileSize + tileSize / 2;

    rumi.x = tileCenterX;
    rumi.y = tileCenterY;
  }

  function moveRumiToGrid(newX: number, newY: number, flip = false) {
    const targetX = offsetX + newX * tileSize + tileSize / 2;
    const targetY = offsetY + newY * tileSize + tileSize / 2;

    switchRumiAnimation("Run", runFrames);
    scaleRumiToFit(flip);

    const tween = new Tween(rumi, tweenGroup) // pass group as second argument
      .to({ x: targetX, y: targetY }, 500)
      .easing(Easing.Quadratic.Out)
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

  await Assets.load("/assets/rumi2.json");

  const idleFrames: Texture[] = getAnimationFrames("Idle", 9);
  const runFrames: Texture[] = getAnimationFrames("Run", 8);
  const slash1Frames: Texture[] = getAnimationFrames("Slash 1", 7);
  const slash2Frames: Texture[] = getAnimationFrames("Slash 2", 5);
  const slamFrames: Texture[] = getAnimationFrames("Slam", 5);
  const spinFrames: Texture[] = getAnimationFrames("Spin Attack", 6);

  const rumi = new AnimatedSprite(idleFrames);
  const tweenGroup = new Group();

  let rumiX = 0;
  let rumiY = 0;
  placeRumiAt();
  scaleRumiToFit();
  rumi.anchor.set(0.3);
  rumi.animationSpeed = 0.15;
  rumi.play();

  app.stage.addChild(rumi);

  let currentAnimation = "Idle";

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

  function switchRumiAnimation(name: string, frames: Texture[]) {
    if (currentAnimation === name) return;
    rumi.textures = frames;
    rumi.play();
    currentAnimation = name;
  }

  let flip = false;
  window.addEventListener("keydown", (e) => {
    let moved = false;

    if (e.key === "ArrowRight") {
      rumiX++;
      flip = false;
      moved = true;
    } else if (e.key === "ArrowLeft") {
      rumiX--;
      flip = true;
      moved = true;
    } else if (e.key === "ArrowUp") {
      rumiY--;
      moved = true;
    } else if (e.key === "ArrowDown") {
      rumiY++;
      moved = true;
    } else if (e.key === "x") {
      playAttack();
    }

    if (moved) {
      scaleRumiToFit(flip); // Flip before moving
      switchRumiAnimation("Run", runFrames);
      moveRumiToGrid(rumiX, rumiY, flip);
    }
  });

  app.ticker.add(() => {
    //rumi.x += 2 * time.deltaTime;
    tweenGroup.update(performance.now());
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
