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
import { CHAPTERS, STORY_NODES } from "@/constants/gameData";

export default function ChaptersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeSave } = useGame();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const chapters = activeSave?.chapters ?? CHAPTERS;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.gold }]}>Chapters</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: botPad + 24 }]}
      >
        <Text style={[styles.worldLore, { color: colors.mutedForeground }]}>
          A world invaded by monsters from another realm. A hero summoned by accident. A goddess with a plan no one was meant to know.
        </Text>

        {chapters.map((chapter, i) => {
          const isActive = activeSave?.currentNodeId
            ? STORY_NODES.find((n) => n.id === activeSave.currentNodeId)?.chapterId === chapter.id
            : false;

          return (
            <TouchableOpacity
              key={chapter.id}
              style={[
                styles.chapterCard,
                {
                  backgroundColor: chapter.unlocked ? colors.card : colors.muted,
                  borderColor: isActive ? colors.crimson : chapter.unlocked ? colors.border : colors.muted,
                  opacity: chapter.unlocked ? 1 : 0.6,
                },
              ]}
              onPress={() => {
                if (chapter.unlocked && activeSave) router.replace("/story");
              }}
              disabled={!chapter.unlocked}
              activeOpacity={0.8}
            >
              <View style={styles.chapterNum}>
                <Text style={[styles.numText, { color: chapter.unlocked ? colors.gold : colors.mutedForeground }]}>
                  {String(chapter.number).padStart(2, "0")}
                </Text>
              </View>
              <View style={styles.chapterInfo}>
                <Text style={[styles.chapterTitle, { color: chapter.unlocked ? colors.foreground : colors.mutedForeground }]}>
                  {chapter.title}
                </Text>
                <Text style={[styles.chapterSub, { color: colors.mutedForeground }]}>{chapter.subtitle}</Text>
                {isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: colors.crimson + "22", borderColor: colors.crimson + "44" }]}>
                    <View style={[styles.activeDot, { backgroundColor: colors.crimson }]} />
                    <Text style={[styles.activeText, { color: colors.crimson }]}>In Progress</Text>
                  </View>
                )}
              </View>
              <Feather
                name={chapter.unlocked ? "chevron-right" : "lock"}
                size={18}
                color={chapter.unlocked ? colors.mutedForeground : colors.muted}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  worldLore: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic", marginBottom: 8 },
  chapterCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  chapterNum: { width: 36 },
  numText: { fontSize: 22, fontFamily: "Inter_700Bold" },
  chapterInfo: { flex: 1, gap: 3 },
  chapterTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  chapterSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  activeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
