import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useGame } from "@/context/GameContext";
import { STORY_NODES } from "@/constants/gameData";
import DialogueBox from "@/components/DialogueBox";

const MOOD_GRADIENT: Record<string, string> = {
  neutral: "#0d0a0e",
  tense: "#1a0a0a",
  mysterious: "#0e0a1a",
  combat: "#1a0a0a",
  revelation: "#1a160a",
  dark: "#050507",
};

export default function StoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeSave, currentNode, makeChoice } = useGame();

  if (!activeSave || !currentNode) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.center, { paddingTop: insets.top + 60 }]}>
          <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
          <Text style={[styles.noSaveText, { color: colors.mutedForeground }]}>No active game. Go back and start a new game.</Text>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.card }]} onPress={() => router.replace("/")}>
            <Text style={[styles.backBtnText, { color: colors.foreground }]}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const bgColor = MOOD_GRADIENT[currentNode.mood] || colors.background;
  const visitedCount = activeSave.visitedNodeIds.length;
  const chapterNodes = STORY_NODES.filter((n) => n.chapterId === currentNode.chapterId);
  const chapterProgress = Math.min(visitedCount / Math.max(chapterNodes.length, 1), 1);

  function handleAdvance() {
    if (!currentNode?.nextNodeId) return;
    const nextNode = STORY_NODES.find((n) => n.id === currentNode.nextNodeId);
    if (!nextNode) return;
    makeChoice("__advance__");
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: bgColor + "dd", borderBottomColor: colors.border + "44" }]}>
        <TouchableOpacity onPress={() => router.replace("/")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="home" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={styles.chapterInfo}>
          <Text style={[styles.chapterLabel, { color: colors.mutedForeground }]}>
            Chapter {activeSave.chapters.findIndex((c) => c.id === currentNode.chapterId) + 1}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { width: `${chapterProgress * 100}%` as any, backgroundColor: colors.crimson }]} />
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push("/character")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="user" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {currentNode.isCombat && (
          <View style={[styles.combatBanner, { backgroundColor: colors.crimson + "22", borderColor: colors.crimson + "55" }]}>
            <Feather name="zap" size={14} color={colors.crimson} />
            <Text style={[styles.combatText, { color: colors.crimson }]}>COMBAT ENCOUNTER</Text>
          </View>
        )}

        <DialogueBox
          node={currentNode}
          onChoice={makeChoice}
          onAdvance={handleAdvance}
        />

        {currentNode.isChapterEnd && (
          <TouchableOpacity
            style={[styles.nextChapterBtn, { backgroundColor: colors.darkPurple, borderColor: colors.purple }]}
            onPress={() => router.push("/chapters")}
            activeOpacity={0.85}
          >
            <Feather name="book-open" size={16} color={colors.purple} />
            <Text style={[styles.nextChapterText, { color: colors.purple }]}>View Chapter Select</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32 },
  noSaveText: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  backBtn: { borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 },
  backBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  chapterInfo: { flex: 1, gap: 4 },
  chapterLabel: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 1 },
  progressBar: { height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  combatBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  combatText: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  nextChapterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 14,
    marginTop: 8,
  },
  nextChapterText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
