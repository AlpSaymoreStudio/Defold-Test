import { Dimensions } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export const SCREEN = { W: SCREEN_W, H: SCREEN_H };

export const MAP = {
  W: 1200,
  H: 1200,
  TILE_SIZE: 32,
};

export const PLAYER = {
  SIZE: 52,
  BASE_SPEED: 3.2,
  BASE_ATTACK_RANGE: 80,
  BASE_ATTACK_DAMAGE: 12,
  BASE_HP: 120,
  BASE_MP: 60,
  ATTACK_COOLDOWN: 600,
  REGEN_INTERVAL: 2000,
};

export const ENEMY = {
  SKULL: {
    SIZE: 44,
    HP: 35,
    SPEED: 1.4,
    DAMAGE: 8,
    XP: 15,
    CHASE_RANGE: 280,
    ATTACK_RANGE: 45,
    ATTACK_COOLDOWN: 1200,
  },
  FROG: {
    SIZE: 40,
    HP: 22,
    SPEED: 2.0,
    DAMAGE: 5,
    XP: 10,
    CHASE_RANGE: 220,
    ATTACK_RANGE: 40,
    ATTACK_COOLDOWN: 900,
  },
  WARRIOR_ENEMY: {
    SIZE: 50,
    HP: 60,
    SPEED: 1.0,
    DAMAGE: 14,
    XP: 25,
    CHASE_RANGE: 200,
    ATTACK_RANGE: 55,
    ATTACK_COOLDOWN: 1500,
  },
};

export const FPS = 60;
export const FRAME_MS = 1000 / FPS;

export function getPlayerStats(baseStats: {
  strength: number;
  mana: number;
  accuracy: number;
  defense: number;
  agility: number;
}) {
  return {
    hp: PLAYER.BASE_HP + baseStats.defense * 8,
    mp: PLAYER.BASE_MP + baseStats.mana * 4,
    speed: PLAYER.BASE_SPEED + baseStats.agility * 0.07,
    damage: PLAYER.BASE_ATTACK_DAMAGE + baseStats.strength * 1.5,
    range: PLAYER.BASE_ATTACK_RANGE + baseStats.accuracy * 1.2,
    defense: baseStats.defense * 0.5,
  };
}

export type EnemyType = "skull" | "frog" | "warrior_enemy";

export const ENEMY_TYPES: EnemyType[] = ["skull", "frog", "skull", "warrior_enemy", "frog"];

export const SPAWN_POINTS = [
  { x: 100, y: 100 },
  { x: 1100, y: 100 },
  { x: 100, y: 1100 },
  { x: 1100, y: 1100 },
  { x: 600, y: 80 },
  { x: 600, y: 1120 },
  { x: 80, y: 600 },
  { x: 1120, y: 600 },
];
