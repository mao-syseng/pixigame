import { AnimatedSprite, Assets, Texture } from "pixi.js";
import { getAnimationFrames } from "./animationHelpers";

await Assets.load("/assets/ghoul.json");

const ghoulWalkFrames: Texture[] = getAnimationFrames("ghoulWalk", 9);
const ghoulAttackFrames: Texture[] = getAnimationFrames("ghoulAttack", 7);
const ghoulDeathFrames: Texture[] = getAnimationFrames("ghoulDeath", 8);
const ghoulSpawnFrames: Texture[] = getAnimationFrames("ghoulSpawn", 11);

export function getGhoulSprite() {
  const ghoul = new AnimatedSprite(ghoulWalkFrames);
}
