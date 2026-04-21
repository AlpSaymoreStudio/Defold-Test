import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GameHUD from "@/components/GameHUD";
import VirtualJoystick from "@/components/VirtualJoystick";
import { BASE_CLASSES } from "@/constants/gameData";
import {
  ENEMY,
  ENEMY_TYPES,
  FRAME_MS,
  MAP,
  PLAYER,
  SPAWN_POINTS,
  getPlayerStats,
} from "@/constants/gameConfig";
import { useColors } from "@/hooks/useColors";
import { useGame } from "@/context/GameContext";

const { width: SW, height: SH } = Dimensions.get("window");

type Vec2 = { x: number; y: number };
type EnemyType = "skull" | "frog" | "warrior_enemy";

type PlayerState = {
  pos: Vec2;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  speed: number;
  damage: number;
  range: number;
  def: number;
  attackTimer: number;
  invTimer: number;
  spellTimer: number;
  level: number;
  xp: number;
  kills: number;
  alive: boolean;
};

type Enemy = {
  id: string;
  type: EnemyType;
  pos: Vec2;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xp: number;
  range: number;
  attackCd: number;
  attackTimer: number;
  alive: boolean;
  hitFlash: number;
};

type DamageNum = {
  id: string;
  x: number;
  y: number;
  val: number;
  crit: boolean;
  ttl: number;
};

type Effect = {
  id: string;
  x: number;
  y: number;
  ttl: number;
};

type JoystickInput = { dx: number; dy: number };

const ENEMY_SPRITES: Record<EnemyType, any> = {
  skull: require("../assets/defold/skull.png"),
  frog: require("../assets/defold/frog.png"),
  warrior_enemy: require("../assets/defold/warrior_enemy.png"),
};

const PLAYER_SPRITES: Record<string, any> = {
  warrior: require("../assets/defold/warrior.png"),
  mage: require("../assets/defold/player.png"),
  rogue: require("../assets/defold/player.png"),
  ranger: require("../assets/defold/player.png"),
  bard: require("../assets/defold/player.png"),
  monk: require("../assets/defold/monk.png"),
  cleric: require("../assets/defold/player.png"),
  alchemist: require("../assets/defold/player.png"),
  shaman: require("../assets/defold/monk.png"),
  summoner: require("../assets/defold/player.png"),
  duelist: require("../assets/defold/warrior.png"),
  seer: require("../assets/defold/player.png"),
};

let eid = 0;
function mkId() {
  return `e${++eid}`;
}

function mkEnemy(type: EnemyType, pos: Vec2): Enemy {
  const cfg =
    type === "skull"
      ? ENEMY.SKULL
      : type === "frog"
        ? ENEMY.FROG
        : ENEMY.WARRIOR_ENEMY;
  return {
    id: mkId(),
    type,
    pos: { ...pos },
    hp: cfg.HP,
    maxHp: cfg.HP,
    speed: cfg.SPEED,
    damage: cfg.DAMAGE,
    xp: cfg.XP,
    range: cfg.ATTACK_RANGE,
    attackCd: cfg.ATTACK_COOLDOWN,
    attackTimer: 0,
    alive: true,
    hitFlash: 0,
  };
}

function dist(a: Vec2, b: Vec2) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export default function GameScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeSave, evolveClass } = useGame();
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const classId = activeSave?.profile.playerClass.baseClassId ?? "warrior";
  const baseStats = activeSave?.profile.stats ?? {
    strength: 8,
    mana: 8,
    accuracy: 8,
    defense: 8,
    agility: 8,
  };
  const computed = useMemo(() => getPlayerStats(baseStats), []);
  const baseClass = BASE_CLASSES.find((c) => c.id === classId);
  const className =
    activeSave?.profile.playerClass.higherClassId
      ? activeSave.profile.playerClass.higherClassId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : (baseClass?.name ?? "Warrior");
  const playerSprite = PLAYER_SPRITES[classId] ?? PLAYER_SPRITES.warrior;

  const joystickRef = useRef<JoystickInput>({ dx: 0, dy: 0 });

  const playerRef = useRef<PlayerState>({
    pos: { x: MAP.W / 2, y: MAP.H / 2 },
    hp: computed.hp,
    maxHp: computed.hp,
    mp: computed.mp,
    maxMp: computed.mp,
    speed: computed.speed,
    damage: computed.damage,
    range: computed.range,
    def: computed.defense,
    attackTimer: 0,
    invTimer: 0,
    spellTimer: 0,
    level: activeSave?.profile.level ?? 1,
    xp: activeSave?.profile.xp ?? 0,
    kills: 0,
    alive: true,
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const damageNumsRef = useRef<DamageNum[]>([]);
  const effectsRef = useRef<Effect[]>([]);

  const [renderTick, setRenderTick] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [waveNum, setWaveNum] = useState(1);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  const playerFlash = useRef(new Animated.Value(1)).current;
  const attackScale = useRef(new Animated.Value(1)).current;
  const spellAnim = useRef(new Animated.Value(0)).current;

  function spawnWave(wave: number) {
    const count = 3 + wave * 2;
    const newEnemies: Enemy[] = [];
    const px = playerRef.current.pos.x;
    const py = playerRef.current.pos.y;
    for (let i = 0; i < count; i++) {
      let spawnPt = SPAWN_POINTS[i % SPAWN_POINTS.length];
      if (dist(spawnPt, { x: px, y: py }) < 200) {
        spawnPt = {
          x: clamp(
            spawnPt.x + (Math.random() > 0.5 ? 300 : -300),
            30,
            MAP.W - 30
          ),
          y: clamp(
            spawnPt.y + (Math.random() > 0.5 ? 300 : -300),
            30,
            MAP.H - 30
          ),
        };
      }
      const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      const scaledEnemy = mkEnemy(type, spawnPt);
      scaledEnemy.hp = Math.floor(scaledEnemy.hp * (1 + wave * 0.2));
      scaledEnemy.maxHp = scaledEnemy.hp;
      scaledEnemy.damage = Math.floor(scaledEnemy.damage * (1 + wave * 0.15));
      newEnemies.push(scaledEnemy);
    }
    enemiesRef.current = [...enemiesRef.current.filter((e) => e.alive), ...newEnemies];
  }

  useEffect(() => {
    spawnWave(1);
    let lastTime = Date.now();
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      const now = Date.now();
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      const p = playerRef.current;
      if (!p.alive) return;

      const joy = joystickRef.current;
      const speed = p.speed * (dt / FRAME_MS);
      p.pos.x = clamp(p.pos.x + joy.dx * speed, 20, MAP.W - 20);
      p.pos.y = clamp(p.pos.y + joy.dy * speed, 20, MAP.H - 20);

      if (p.attackTimer > 0) p.attackTimer = Math.max(0, p.attackTimer - dt);
      if (p.invTimer > 0) p.invTimer = Math.max(0, p.invTimer - dt);
      if (p.spellTimer > 0) p.spellTimer = Math.max(0, p.spellTimer - dt);

      for (const e of enemiesRef.current) {
        if (!e.alive) continue;
        const d = dist(e.pos, p.pos);
        const cfg =
          e.type === "skull"
            ? ENEMY.SKULL
            : e.type === "frog"
              ? ENEMY.FROG
              : ENEMY.WARRIOR_ENEMY;

        if (d < cfg.CHASE_RANGE) {
          const angle = Math.atan2(p.pos.y - e.pos.y, p.pos.x - e.pos.x);
          const es = e.speed * (dt / FRAME_MS);
          e.pos.x = clamp(e.pos.x + Math.cos(angle) * es, 20, MAP.W - 20);
          e.pos.y = clamp(e.pos.y + Math.sin(angle) * es, 20, MAP.H - 20);
        }

        if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);

        if (e.attackTimer > 0) {
          e.attackTimer = Math.max(0, e.attackTimer - dt);
        } else if (d < e.range + 20 && p.invTimer <= 0) {
          const dmg = Math.max(1, e.damage - p.def * 0.4);
          p.hp = Math.max(0, p.hp - dmg);
          p.invTimer = 800;
          e.attackTimer = e.attackCd;
          damageNumsRef.current.push({
            id: mkId(),
            x: p.pos.x + (Math.random() * 40 - 20),
            y: p.pos.y - 30,
            val: Math.round(dmg),
            crit: false,
            ttl: 900,
          });
          Animated.sequence([
            Animated.timing(playerFlash, { toValue: 0.2, duration: 80, useNativeDriver: true }),
            Animated.timing(playerFlash, { toValue: 1, duration: 200, useNativeDriver: true }),
          ]).start();
          if (p.hp <= 0) {
            p.alive = false;
            setGameOver(true);
          }
        }
      }

      damageNumsRef.current = damageNumsRef.current
        .map((d) => ({ ...d, y: d.y - 0.4, ttl: d.ttl - dt }))
        .filter((d) => d.ttl > 0);

      effectsRef.current = effectsRef.current
        .map((ef) => ({ ...ef, ttl: ef.ttl - dt }))
        .filter((ef) => ef.ttl > 0);

      const alive = enemiesRef.current.filter((e) => e.alive);
      if (alive.length === 0) {
        const next = waveNum + 1;
        setWaveNum(next);
        spawnWave(next);
      }

      setRenderTick((t) => t + 1);
    }, FRAME_MS);
    return () => clearInterval(interval);
  }, []);

  const handleAttack = useCallback(() => {
    const p = playerRef.current;
    if (!p.alive || p.attackTimer > 0) return;
    p.attackTimer = PLAYER.ATTACK_COOLDOWN;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(attackScale, { toValue: 1.35, duration: 80, useNativeDriver: true }),
      Animated.timing(attackScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    let hit = false;
    for (const e of enemiesRef.current) {
      if (!e.alive) continue;
      const d = dist(p.pos, e.pos);
      if (d < p.range) {
        const crit = Math.random() < 0.15;
        const dmg = Math.round((p.damage + Math.random() * p.damage * 0.3) * (crit ? 2 : 1));
        e.hp -= dmg;
        e.hitFlash = 200;
        hit = true;
        damageNumsRef.current.push({
          id: mkId(),
          x: e.pos.x + (Math.random() * 30 - 15),
          y: e.pos.y - 30,
          val: dmg,
          crit,
          ttl: 900,
        });
        effectsRef.current.push({ id: mkId(), x: e.pos.x, y: e.pos.y, ttl: 350 });
        if (e.hp <= 0) {
          e.alive = false;
          p.xp += e.xp;
          p.kills += 1;
          const xpNeeded = p.level * 100;
          if (p.xp >= xpNeeded) {
            p.level += 1;
            p.xp -= xpNeeded;
            p.maxHp += 15;
            p.hp = Math.min(p.hp + 30, p.maxHp);
            p.damage += 3;
          }
        }
      }
    }
    if (!hit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleSpell = useCallback(() => {
    const p = playerRef.current;
    if (!p.alive || p.spellTimer > 0 || p.mp < 20) return;
    p.mp -= 20;
    p.spellTimer = 3000;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(spellAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(spellAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    const aoeRange = p.range * 1.8;
    for (const e of enemiesRef.current) {
      if (!e.alive) continue;
      const d = dist(p.pos, e.pos);
      if (d < aoeRange) {
        const dmg = Math.round(p.damage * 1.5 + baseStats.mana * 3);
        e.hp -= dmg;
        e.hitFlash = 300;
        damageNumsRef.current.push({
          id: mkId(),
          x: e.pos.x + (Math.random() * 30 - 15),
          y: e.pos.y - 30,
          val: dmg,
          crit: true,
          ttl: 1000,
        });
        effectsRef.current.push({ id: mkId(), x: e.pos.x, y: e.pos.y, ttl: 500 });
        if (e.hp <= 0) {
          e.alive = false;
          p.xp += e.xp;
          p.kills += 1;
        }
      }
    }
  }, []);

  const p = playerRef.current;
  const camX = clamp(p.pos.x - SW / 2, 0, MAP.W - SW);
  const camY = clamp(p.pos.y - SH / 2, 0, MAP.H - SH);

  const topHUD = insets.top + (Platform.OS === "web" ? 67 : 0) + 10;
  const botControls = botPad + 16;

  const tileSize = MAP.TILE_SIZE;
  const tilesX = Math.ceil(SW / tileSize) + 2;
  const tilesY = Math.ceil(SH / tileSize) + 2;
  const startTX = Math.floor(camX / tileSize);
  const startTY = Math.floor(camY / tileSize);

  return (
    <View style={[styles.root, { backgroundColor: "#080508" }]}>
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: tilesY }).map((_, ty) =>
          Array.from({ length: tilesX }).map((_, tx) => {
            const wx = (startTX + tx) * tileSize;
            const wy = (startTY + ty) * tileSize;
            if (wx < 0 || wy < 0 || wx >= MAP.W || wy >= MAP.H) return null;
            const isDark = ((startTX + tx) + (startTY + ty)) % 2 === 0;
            return (
              <View
                key={`${tx}-${ty}`}
                style={{
                  position: "absolute",
                  left: wx - camX,
                  top: wy - camY,
                  width: tileSize,
                  height: tileSize,
                  backgroundColor: isDark ? "#0e0b10" : "#130d16",
                  borderWidth: 0.5,
                  borderColor: "#1a1220",
                }}
              />
            );
          })
        )}
      </View>

      {effectsRef.current.map((ef) => (
        <Image
          key={ef.id}
          source={require("../assets/defold/explosion.png")}
          style={{
            position: "absolute",
            left: ef.x - camX - 24,
            top: ef.y - camY - 24,
            width: 48,
            height: 48,
            opacity: ef.ttl / 350,
          }}
          resizeMode="contain"
        />
      ))}

      {enemiesRef.current.filter((e) => e.alive).map((e) => {
        const ex = e.pos.x - camX;
        const ey = e.pos.y - camY;
        if (ex < -60 || ex > SW + 60 || ey < -60 || ey > SH + 60) return null;
        const cfg =
          e.type === "skull" ? ENEMY.SKULL : e.type === "frog" ? ENEMY.FROG : ENEMY.WARRIOR_ENEMY;
        const hpPct = e.hp / e.maxHp;
        return (
          <View key={e.id} style={{ position: "absolute", left: ex - cfg.SIZE / 2, top: ey - cfg.SIZE / 2 }}>
            <Image
              source={ENEMY_SPRITES[e.type]}
              style={{
                width: cfg.SIZE,
                height: cfg.SIZE,
                opacity: e.hitFlash > 0 ? 0.4 : 1,
              }}
              resizeMode="contain"
            />
            <View style={[styles.enemyHpBg, { backgroundColor: "#1a0a0a" }]}>
              <View style={[styles.enemyHpFill, { width: `${hpPct * 100}%` as any, backgroundColor: hpPct > 0.5 ? "#27ae60" : "#c0392b" }]} />
            </View>
          </View>
        );
      })}

      <Animated.View
        style={{
          position: "absolute",
          left: p.pos.x - camX - PLAYER.SIZE / 2,
          top: p.pos.y - camY - PLAYER.SIZE / 2,
          opacity: playerFlash,
          transform: [{ scale: attackScale }],
        }}
      >
        <Image
          source={playerSprite}
          style={{ width: PLAYER.SIZE, height: PLAYER.SIZE }}
          resizeMode="contain"
        />
        <View style={[styles.playerRing, { borderColor: "#c8a96e55" }]} />
      </Animated.View>

      {damageNumsRef.current.map((d) => (
        <Text
          key={d.id}
          style={[
            styles.damageNum,
            {
              left: d.x - camX,
              top: d.y - camY,
              color: d.crit ? "#f1c40f" : "#e74c3c",
              fontSize: d.crit ? 20 : 15,
            },
          ]}
        >
          {d.crit ? "!" : ""}{d.val}
        </Text>
      ))}

      <GameHUD
        hp={p.hp}
        maxHp={p.maxHp}
        mp={p.mp}
        maxMp={p.maxMp}
        level={p.level}
        kills={p.kills}
        playerClass={className}
        xp={p.xp}
        xpToNext={p.level * 100}
      />

      <View style={[styles.waveTag, { top: topHUD, backgroundColor: "rgba(13,10,14,0.8)", borderColor: "#3d2a4a" }]}>
        <Text style={[styles.waveText, { color: "#c8a96e" }]}>WAVE {waveNum}</Text>
        <Text style={[styles.enemyCount, { color: "#7a6b5a" }]}>
          {enemiesRef.current.filter((e) => e.alive).length} enemies
        </Text>
      </View>

      <View style={[styles.controls, { bottom: botControls }]}>
        <VirtualJoystick
          size={120}
          onMove={(dx, dy) => { joystickRef.current = { dx, dy }; }}
          onRelease={() => { joystickRef.current = { dx: 0, dy: 0 }; }}
        />

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.spellBtn, { backgroundColor: p.mp >= 20 && p.spellTimer <= 0 ? "#1a3a7a" : "#1a1428", borderColor: "#3498db44" }]}
            onPress={handleSpell}
            activeOpacity={0.7}
          >
            <Text style={[styles.btnIcon, { color: p.mp >= 20 && p.spellTimer <= 0 ? "#3498db" : "#3d2a4a" }]}>✦</Text>
            <Text style={[styles.btnLabel, { color: "#3498db88" }]}>-20 MP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.attackBtn, { backgroundColor: p.attackTimer <= 0 ? "#3a0a0a" : "#1a0808", borderColor: "#c0392b88" }]}
            onPress={handleAttack}
            activeOpacity={0.7}
          >
            <Text style={[styles.btnIcon, { color: p.attackTimer <= 0 ? "#c0392b" : "#6a2020" }]}>⚔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.pauseBtn, { top: insets.top + (Platform.OS === "web" ? 67 : 0) + 120, backgroundColor: "rgba(13,10,14,0.8)", borderColor: "#3d2a4a" }]}
        onPress={() => {
          const next = !pausedRef.current;
          pausedRef.current = next;
          setPaused(next);
        }}
      >
        <Feather name={paused ? "play" : "pause"} size={16} color="#7a6b5a" />
      </TouchableOpacity>

      {paused && (
        <View style={[StyleSheet.absoluteFill, styles.pauseOverlay]}>
          <View style={[styles.pausePanel, { backgroundColor: "#0d0a0e", borderColor: "#3d2a4a" }]}>
            <Text style={[styles.pauseTitle, { color: "#c8a96e" }]}>PAUSED</Text>
            <TouchableOpacity style={[styles.pauseAction, { borderColor: "#3d2a4a" }]} onPress={() => { pausedRef.current = false; setPaused(false); }}>
              <Text style={{ color: "#e8d5b7", fontFamily: "Inter_600SemiBold" }}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pauseAction, { borderColor: "#3d2a4a" }]} onPress={() => router.replace("/")}>
              <Text style={{ color: "#7a6b5a", fontFamily: "Inter_500Medium" }}>Quit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {gameOver && (
        <View style={[StyleSheet.absoluteFill, styles.pauseOverlay]}>
          <View style={[styles.pausePanel, { backgroundColor: "#0d0a0e", borderColor: "#922b21" }]}>
            <Text style={[styles.pauseTitle, { color: "#c0392b" }]}>FALLEN</Text>
            <Text style={[styles.statLine, { color: "#7a6b5a" }]}>Enemies slain: {p.kills}</Text>
            <Text style={[styles.statLine, { color: "#7a6b5a" }]}>Level reached: {p.level}</Text>
            <Text style={[styles.statLine, { color: "#7a6b5a" }]}>Wave: {waveNum}</Text>
            <TouchableOpacity style={[styles.pauseAction, { borderColor: "#922b21", marginTop: 12 }]} onPress={() => router.replace("/")}>
              <Text style={{ color: "#c0392b", fontFamily: "Inter_600SemiBold" }}>Back to Title</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  enemyHpBg: { width: "100%", height: 4, borderRadius: 2, marginTop: 2, overflow: "hidden" },
  enemyHpFill: { height: "100%", borderRadius: 2 },
  playerRing: {
    position: "absolute",
    left: -4,
    top: -4,
    right: -4,
    bottom: -4,
    borderRadius: 999,
    borderWidth: 1,
  },
  damageNum: {
    position: "absolute",
    fontFamily: "Inter_700Bold",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  waveTag: {
    position: "absolute",
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  waveText: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  enemyCount: { fontSize: 11, fontFamily: "Inter_500Medium" },
  controls: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  actionButtons: { flexDirection: "column", alignItems: "center", gap: 12 },
  attackBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  spellBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  btnIcon: { fontSize: 24, fontFamily: "Inter_700Bold" },
  btnLabel: { fontSize: 9, fontFamily: "Inter_500Medium" },
  pauseBtn: {
    position: "absolute",
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pauseOverlay: {
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  pausePanel: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 28,
    alignItems: "center",
    gap: 12,
    minWidth: 220,
  },
  pauseTitle: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: 4 },
  statLine: { fontSize: 14, fontFamily: "Inter_500Medium" },
  pauseAction: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
});
