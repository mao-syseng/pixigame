import { AnimatedSprite, Application, Assets, Texture } from "pixi.js";

(async () => {
  const app = new Application();
  await app.init({
    background: "#f8e9e5",
    resizeTo: window,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
  });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  await Assets.load("/assets/rumi2.json");

  const idleFrames: Texture[] = getAnimationFrames("Idle", 9);
  const runFrames: Texture[] = getAnimationFrames("Run", 8);
  const slash1Frames: Texture[] = getAnimationFrames("Slash 1", 7);
  const slash2Frames: Texture[] = getAnimationFrames("Slash 2", 5);
  const slamFrames: Texture[] = getAnimationFrames("Slam", 5);
  const spinFrames: Texture[] = getAnimationFrames("Spin Attack", 6);

  const rumi = new AnimatedSprite(idleFrames);
  rumi.x = app.screen.width / 2;
  rumi.y = app.screen.height / 2;
  rumi.anchor.set(0.3);
  rumi.animationSpeed = 0.15;
  rumi.scale = 2;
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

    const randomAttack = getRandomAttack();
    switchAnimation(randomAttack.name, randomAttack.frames);
    rumi.loop = false;

    rumi.onComplete = () => {
      isAttacking = false;
      rumi.loop = true;
      switchAnimation("Idle", idleFrames);
    };

    rumi.play();
  }

  function getRandomAttack() {
    const attacks = [
      {
        name: "Slam",
        frames: slamFrames,
      },
      {
        name: "Slash 1",
        frames: slash1Frames,
      },
      {
        name: "Slash 2",
        frames: slash2Frames,
      },
      {
        name: "Spin Attack",
        frames: spinFrames,
      },
    ];

    const randomIndex = Math.floor(Math.random() * attacks.length);
    return attacks[randomIndex];
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
      rumi.scale.x = 2; // face right
      switchAnimation("Run", runFrames);
    } else if (e.key === "ArrowLeft") {
      isMovingLeft = true;
      rumi.scale.x = -2; // face left (flip horizontally)
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
