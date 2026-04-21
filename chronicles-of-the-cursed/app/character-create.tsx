import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useGame } from "@/context/GameContext";
import { BASE_CLASSES } from "@/constants/gameData";
import ClassCard from "@/components/ClassCard";
import StatsBar from "@/components/StatsBar";

type Step = "name" | "class" | "confirm";

export default function CharacterCreateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { createSave } = useGame();

  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const selectedClass = BASE_CLASSES.find((c) => c.id === selectedClassId);

  async function handleCreate() {
    if (!name.trim() || !selectedClassId) return;
    setCreating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await createSave(name.trim(), selectedClassId);
    setCreating(false);
    router.replace("/game");
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => step === "name" ? router.back() : setStep(step === "class" ? "name" : "class")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.gold }]}>
          {step === "name" ? "Who Are You?" : step === "class" ? "Choose Your Path" : "Confirm Character"}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.stepsRow}>
        {(["name", "class", "confirm"] as Step[]).map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[
              styles.stepDot,
              {
                backgroundColor: step === s ? colors.crimson : s === "name" || (step === "class" && i < 1) || (step === "confirm" && i < 2)
                  ? colors.darkGold : colors.muted,
              },
            ]} />
            <Text style={[styles.stepLabel, { color: step === s ? colors.gold : colors.mutedForeground }]}>
              {s === "name" ? "Name" : s === "class" ? "Class" : "Confirm"}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: botPad + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {step === "name" && (
          <View style={styles.nameStep}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>You were pulled from your world with no warning. No preparation. No blessing from the goddess.</Text>
            <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>What do they call you, stranger?</Text>
            <TextInput
              style={[styles.nameInput, { color: colors.foreground, borderColor: name.length > 0 ? colors.crimson : colors.border, backgroundColor: colors.card }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name..."
              placeholderTextColor={colors.mutedForeground}
              maxLength={24}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: name.trim().length > 1 ? colors.crimson : colors.muted }]}
              onPress={() => name.trim().length > 1 && setStep("class")}
              activeOpacity={0.85}
            >
              <Text style={[styles.nextBtnText, { color: name.trim().length > 1 ? colors.primaryForeground : colors.mutedForeground }]}>Choose Your Path</Text>
              <Feather name="arrow-right" size={18} color={name.trim().length > 1 ? colors.primaryForeground : colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}

        {step === "class" && (
          <View style={styles.classStep}>
            <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>
              You have no goddess's blessing. No prophecy favors you. But you have something — a class. Choose what you are.
            </Text>
            <Text style={[styles.higherClassNote, { color: colors.gold }]}>
              Each class evolves into 3 higher classes as you progress.
            </Text>
            <View style={styles.classList}>
              {BASE_CLASSES.map((cls) => (
                <ClassCard key={cls.id} cls={cls} selected={selectedClassId === cls.id} onSelect={setSelectedClassId} />
              ))}
            </View>
            {selectedClassId && (
              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: colors.crimson }]}
                onPress={() => setStep("confirm")}
                activeOpacity={0.85}
              >
                <Text style={[styles.nextBtnText, { color: colors.primaryForeground }]}>Review Character</Text>
                <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {step === "confirm" && selectedClass && (
          <View style={styles.confirmStep}>
            <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: selectedClass.color }]}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>{name}</Text>
              <View style={[styles.classTag, { backgroundColor: selectedClass.color + "22", borderColor: selectedClass.color + "55" }]}>
                <Feather name={selectedClass.icon as any} size={14} color={selectedClass.color} />
                <Text style={[styles.classTagText, { color: selectedClass.color }]}>{selectedClass.name}</Text>
              </View>
              <Text style={[styles.loreText, { color: colors.mutedForeground }]}>{selectedClass.lore}</Text>
            </View>

            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statsTitle, { color: colors.foreground }]}>Base Stats</Text>
              <StatsBar stats={selectedClass.baseStats} />
            </View>

            <View style={[styles.evolutionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statsTitle, { color: colors.foreground }]}>Evolution Paths</Text>
              {selectedClass.higherClasses.map((hc) => (
                <View key={hc.id} style={styles.evolutionRow}>
                  <View style={[styles.evolutionDot, { backgroundColor: hc.color }]} />
                  <View style={styles.evolutionInfo}>
                    <Text style={[styles.evolutionName, { color: hc.color }]}>{hc.name}</Text>
                    {hc.uniqueStat && (
                      <Text style={[styles.evolutionUnique, { color: colors.accent }]}>
                        + {hc.uniqueStat.name}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: colors.crimson }]}
              onPress={handleCreate}
              disabled={creating}
              activeOpacity={0.85}
            >
              <Feather name="play" size={18} color={colors.primaryForeground} />
              <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>
                {creating ? "Entering..." : "Begin Your Story"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  stepsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  stepItem: { alignItems: "center", gap: 4 },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  nameStep: { gap: 16 },
  stepTitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24 },
  stepHint: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  nameInput: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 4,
  },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  classStep: { gap: 12 },
  classList: {},
  higherClassNote: { fontSize: 12, fontFamily: "Inter_500Medium", fontStyle: "italic" },
  confirmStep: { gap: 14 },
  profileCard: { borderRadius: 8, borderWidth: 1.5, padding: 18, gap: 10 },
  profileName: { fontSize: 24, fontFamily: "Inter_700Bold" },
  classTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  classTagText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  loreText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic" },
  statsCard: { borderRadius: 8, borderWidth: 1, padding: 16, gap: 10 },
  statsTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
  evolutionCard: { borderRadius: 8, borderWidth: 1, padding: 16, gap: 10 },
  evolutionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  evolutionDot: { width: 10, height: 10, borderRadius: 5 },
  evolutionInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  evolutionName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  evolutionUnique: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 8,
    paddingVertical: 18,
    marginTop: 4,
  },
  startBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
});
