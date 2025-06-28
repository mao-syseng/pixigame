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

  await Assets.load("/assets/rumi.json");

  const animations: Record<string, Texture[]> = {
    run: [],
    idle: [],
    att1: [],
    att2: [],
    att3: [],
  };

  const frames: Texture[] = [];

  for (let i = 0; i < 8; i++) {
    const texture = Texture.from(`rumi${i}.aseprite`);
    texture.source.style.scaleMode = "nearest";
    frames.push(texture);
  }

  const rumi = new AnimatedSprite(frames);
  rumi.x = app.screen.width / 2;
  rumi.y = app.screen.height / 2;
  rumi.anchor.set(0.5);
  rumi.animationSpeed = 0.15;
  rumi.scale = 2;
  rumi.play();

  app.stage.addChild(rumi);

  app.ticker.add((time) => {
    rumi.x += 1 * time.deltaTime;
  });
})();
