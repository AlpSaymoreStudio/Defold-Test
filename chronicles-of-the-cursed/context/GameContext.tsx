import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  BASE_CLASSES,
  BaseClass,
  Chapter,
  CHAPTERS,
  HigherClass,
  PlayerClass,
  PlayerStats,
  STORY_NODES,
  StoryNode,
  UniqueStatKey,
} from "@/constants/gameData";

export type CharacterProfile = {
  id: string;
  name: string;
  playerClass: PlayerClass;
  stats: PlayerStats;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  createdAt: number;
};

export type SaveSlot = {
  profile: CharacterProfile;
  currentNodeId: string;
  visitedNodeIds: string[];
  chapters: Chapter[];
  relationships: Record<string, "ally" | "enemy" | "neutral">;
  playTimeSeconds: number;
  savedAt: number;
};

type GameContextType = {
  saves: SaveSlot[];
  activeSave: SaveSlot | null;
  currentNode: StoryNode | null;
  loading: boolean;
  createSave: (name: string, classId: string) => Promise<void>;
  loadSave: (saveIndex: number) => void;
  deleteSave: (saveIndex: number) => Promise<void>;
  makeChoice: (choiceId: string) => void;
  evolveClass: (higherClassId: string) => void;
  getBaseClass: (id: string) => BaseClass | undefined;
  getHigherClass: (baseClassId: string, higherClassId: string) => HigherClass | undefined;
};

const GameContext = createContext<GameContextType | null>(null);

const STORAGE_KEY = "@dark_rpg_saves";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function computeBaseStats(classId: string): PlayerStats {
  const cls = BASE_CLASSES.find((c) => c.id === classId);
  if (!cls) return { strength: 5, mana: 5, accuracy: 5, defense: 5, agility: 5 };
  return { ...cls.baseStats };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [saves, setSaves] = useState<SaveSlot[]>([]);
  const [activeSave, setActiveSave] = useState<SaveSlot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaves();
  }, []);

  async function loadSaves() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setSaves(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }

  async function persistSaves(newSaves: SaveSlot[]) {
    setSaves(newSaves);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSaves));
  }

  const createSave = useCallback(async (name: string, classId: string) => {
    const stats = computeBaseStats(classId);
    const profile: CharacterProfile = {
      id: generateId(),
      name,
      playerClass: { baseClassId: classId },
      stats,
      level: 1,
      xp: 0,
      hp: 100 + stats.defense * 5,
      maxHp: 100 + stats.defense * 5,
      createdAt: Date.now(),
    };
    const newSave: SaveSlot = {
      profile,
      currentNodeId: "ch1_start",
      visitedNodeIds: [],
      chapters: CHAPTERS.map((c, i) => ({ ...c, unlocked: i === 0 })),
      relationships: {},
      playTimeSeconds: 0,
      savedAt: Date.now(),
    };
    const newSaves = [...saves, newSave];
    await persistSaves(newSaves);
    setActiveSave(newSave);
  }, [saves]);

  const loadSave = useCallback((saveIndex: number) => {
    if (saves[saveIndex]) setActiveSave(saves[saveIndex]);
  }, [saves]);

  const deleteSave = useCallback(async (saveIndex: number) => {
    const newSaves = saves.filter((_, i) => i !== saveIndex);
    await persistSaves(newSaves);
    if (activeSave === saves[saveIndex]) setActiveSave(null);
  }, [saves, activeSave]);

  const makeChoice = useCallback((choiceId: string) => {
    if (!activeSave || !activeSave.currentNodeId) return;
    const node = STORY_NODES.find((n) => n.id === activeSave.currentNodeId);
    if (!node?.choices) return;
    const choice = node.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    const updated: SaveSlot = {
      ...activeSave,
      currentNodeId: choice.nextNodeId,
      visitedNodeIds: [...activeSave.visitedNodeIds, activeSave.currentNodeId],
      relationships: choice.affectsRelationship
        ? { ...activeSave.relationships, [choiceId]: choice.affectsRelationship }
        : activeSave.relationships,
      savedAt: Date.now(),
    };
    setActiveSave(updated);
    setSaves((prev) => {
      const idx = prev.findIndex((s) => s.profile.id === activeSave.profile.id);
      if (idx === -1) return prev;
      const newSaves = [...prev];
      newSaves[idx] = updated;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSaves));
      return newSaves;
    });
  }, [activeSave]);

  const advanceNode = useCallback(() => {
    if (!activeSave) return;
    const node = STORY_NODES.find((n) => n.id === activeSave.currentNodeId);
    if (!node?.nextNodeId) return;

    const updated: SaveSlot = {
      ...activeSave,
      currentNodeId: node.nextNodeId,
      visitedNodeIds: [...activeSave.visitedNodeIds, activeSave.currentNodeId],
      savedAt: Date.now(),
    };
    setActiveSave(updated);
    setSaves((prev) => {
      const idx = prev.findIndex((s) => s.profile.id === activeSave.profile.id);
      if (idx === -1) return prev;
      const newSaves = [...prev];
      newSaves[idx] = updated;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSaves));
      return newSaves;
    });
  }, [activeSave]);

  const evolveClass = useCallback((higherClassId: string) => {
    if (!activeSave) return;
    const baseClass = BASE_CLASSES.find((c) => c.id === activeSave.profile.playerClass.baseClassId);
    if (!baseClass) return;
    const higherClass = baseClass.higherClasses.find((h) => h.id === higherClassId);
    if (!higherClass) return;

    const newStats = { ...activeSave.profile.stats };
    Object.entries(higherClass.statBonus).forEach(([key, val]) => {
      if (val !== undefined) {
        (newStats as Record<string, number>)[key] = ((newStats as Record<string, number>)[key] || 0) + val;
      }
    });
    if (higherClass.uniqueStat) {
      (newStats as Record<string, number>)[higherClass.uniqueStat.key] = 0;
    }

    const updated: SaveSlot = {
      ...activeSave,
      profile: {
        ...activeSave.profile,
        playerClass: { ...activeSave.profile.playerClass, higherClassId },
        stats: newStats,
      },
      savedAt: Date.now(),
    };
    setActiveSave(updated);
    setSaves((prev) => {
      const idx = prev.findIndex((s) => s.profile.id === activeSave.profile.id);
      if (idx === -1) return prev;
      const newSaves = [...prev];
      newSaves[idx] = updated;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSaves));
      return newSaves;
    });
  }, [activeSave]);

  const currentNode = activeSave
    ? STORY_NODES.find((n) => n.id === activeSave.currentNodeId) ?? null
    : null;

  const getBaseClass = useCallback((id: string) => BASE_CLASSES.find((c) => c.id === id), []);

  const getHigherClass = useCallback((baseClassId: string, higherClassId: string) => {
    const base = BASE_CLASSES.find((c) => c.id === baseClassId);
    return base?.higherClasses.find((h) => h.id === higherClassId);
  }, []);

  return (
    <GameContext.Provider value={{
      saves,
      activeSave,
      currentNode,
      loading,
      createSave,
      loadSave,
      deleteSave,
      makeChoice,
      evolveClass,
      getBaseClass,
      getHigherClass,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
