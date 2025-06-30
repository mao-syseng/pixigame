import { AnimatedSprite, Sprite, Texture } from "pixi.js";

export interface GridSize {
  offsetX: number;
  offsetY: number;
  tileSize: number;
}

export function getAnimationFrames(
  name: string,
  frameCount: number
): Texture[] {
  const frames: Texture[] = [];

  for (let i = 0; i < frameCount; i++) {
    const texture = Texture.from(`${name}${i}.aseprite`);
    texture.source.style.scaleMode = "nearest";
    frames.push(texture);
  }

  return frames;
}

export function placeOnGrid(
  sprite: AnimatedSprite,
  newX: number,
  newY: number,
  { offsetX, offsetY, tileSize }: GridSize
) {
  const tileCenterX = offsetX + newX * tileSize + tileSize / 2;
  const tileCenterY = offsetY + newY * tileSize + tileSize / 2;

  sprite.x = tileCenterX;
  sprite.y = tileCenterY;
}
