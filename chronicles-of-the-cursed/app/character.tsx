import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { BASE_CLASSES } from "@/constants/gameData";
import StatsBar from "@/components/StatsBar";
import HigherClassCard from "@/components/HigherClassCard";

export default function CharacterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeSave, evolveClass, getBaseClass, getHigherClass } = useGame();
  const [showEvolution, setShowEvolution] = useState(false);

  if (!activeSave) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.center, { paddingTop: insets.top + 60 }]}>
          <Text style={[styles.noData, { color: colors.mutedForeground }]}>No active character.</Text>
          <TouchableOpacity onPress={() => router.replace("/")} style={[styles.homeBtn, { backgroundColor: colors.card }]}>
            <Text style={[styles.homeBtnText, { color: colors.foreground }]}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { profile } = activeSave;
  const baseClass = getBaseClass(profile.playerClass.baseClassId);
  const higherClass = profile.playerClass.higherClassId
    ? getHigherClass(profile.playerClass.baseClassId, profile.playerClass.higherClassId)
    : null;
  const uniqueStat = higherClass?.uniqueStat;

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const xpToNext = profile.level * 100;
  const xpPct = Math.min(profile.xp / xpToNext, 1);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.gold }]}>Character</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: baseClass?.color || colors.border }]}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.foreground }]}>{profile.name}</Text>
            <View style={[styles.levelBadge, { backgroundColor: colors.crimson + "22", borderColor: colors.crimson + "55" }]}>
              <Text style={[styles.levelText, { color: colors.crimson }]}>Lv {profile.level}</Text>
            </View>
          </View>

          {baseClass && (
            <View style={styles.classRow}>
              <View style={[styles.classTag, { backgroundColor: baseClass.color + "22", borderColor: baseClass.color + "44" }]}>
                <Feather name={baseClass.icon as any} size={13} color={baseClass.color} />
                <Text style={[styles.classTagText, { color: baseClass.color }]}>{baseClass.name}</Text>
              </View>
              {higherClass && (
                <>
                  <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                  <View style={[styles.classTag, { backgroundColor: higherClass.color + "22", borderColor: higherClass.color + "44" }]}>
                    <Text style={[styles.classTagText, { color: higherClass.color }]}>{higherClass.name}</Text>
                  </View>
                </>
              )}
            </View>
          )}

          <View style={styles.xpRow}>
            <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>XP {profile.xp} / {xpToNext}</Text>
            <View style={[styles.xpBar, { backgroundColor: colors.muted }]}>
              <View style={[styles.xpFill, { width: `${xpPct * 100}%` as any, backgroundColor: colors.gold }]} />
            </View>
          </View>

          <View style={styles.hpRow}>
            <Feather name="heart" size={14} color={colors.destructive} />
            <Text style={[styles.hpText, { color: colors.destructive }]}>{profile.hp} / {profile.maxHp}</Text>
            <View style={[styles.hpBar, { backgroundColor: colors.muted, flex: 1, marginLeft: 8 }]}>
              <View style={[styles.hpFill, { width: `${(profile.hp / profile.maxHp) * 100}%` as any, backgroundColor: colors.destructive }]} />
            </View>
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Stats</Text>
          <StatsBar
            stats={profile.stats}
            uniqueStatKey={uniqueStat?.key}
            uniqueStatName={uniqueStat?.name}
          />
          {uniqueStat && (
            <View style={[styles.uniqueInfo, { backgroundColor: colors.accent + "11", borderColor: colors.accent + "33" }]}>
              <Feather name="zap" size={12} color={colors.accent} />
              <Text style={[styles.uniqueDesc, { color: colors.mutedForeground }]}>
                {uniqueStat.description}
              </Text>
            </View>
          )}
        </View>

        {baseClass && !profile.playerClass.higherClassId && (
          <View>
            <TouchableOpacity
              style={[styles.evolveToggle, { backgroundColor: colors.darkPurple, borderColor: colors.purple }]}
              onPress={() => setShowEvolution((v) => !v)}
              activeOpacity={0.85}
            >
              <Feather name="git-branch" size={16} color={colors.purple} />
              <Text style={[styles.evolveToggleText, { color: colors.purple }]}>
                {showEvolution ? "Hide Evolution Paths" : "Choose Evolution Path"}
              </Text>
              <Feather name={showEvolution ? "chevron-up" : "chevron-down"} size={16} color={colors.purple} />
            </TouchableOpacity>

            {showEvolution && (
              <View style={styles.evolutionList}>
                <Text style={[styles.evolutionHint, { color: colors.mutedForeground }]}>
                  Evolving is permanent. Choose carefully.
                </Text>
                {baseClass.higherClasses.map((hc) => (
                  <HigherClassCard
                    key={hc.id}
                    cls={hc}
                    selected={false}
                    onSelect={(id) => {
                      evolveClass(id);
                      setShowEvolution(false);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {higherClass && (
          <View style={[styles.abilitiesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Abilities</Text>
            {higherClass.abilities.map((ability, i) => (
              <View key={i} style={[styles.abilityRow, { borderColor: colors.border }]}>
                <View style={[styles.abilityIcon, { backgroundColor: higherClass.color + "22" }]}>
                  <Feather name="zap" size={14} color={higherClass.color} />
                </View>
                <Text style={[styles.abilityName, { color: colors.foreground }]}>{ability}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  noData: { fontSize: 15, fontFamily: "Inter_400Regular" },
  homeBtn: { borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 },
  homeBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, gap: 14 },
  profileCard: { borderRadius: 8, borderWidth: 1.5, padding: 18, gap: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  levelBadge: { borderRadius: 4, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  levelText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  classRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  classTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  classTagText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  xpRow: { gap: 4 },
  xpLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  xpBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  xpFill: { height: "100%", borderRadius: 2 },
  hpRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  hpText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hpBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  hpFill: { height: "100%", borderRadius: 3 },
  statsCard: { borderRadius: 8, borderWidth: 1, padding: 16, gap: 10 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
  uniqueInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
    marginTop: 4,
  },
  uniqueDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, flex: 1 },
  evolveToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 14,
  },
  evolveToggleText: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center" },
  evolutionList: { gap: 0, marginTop: 12 },
  evolutionHint: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic", marginBottom: 10 },
  abilitiesCard: { borderRadius: 8, borderWidth: 1, padding: 16, gap: 10 },
  abilityRow: { flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, paddingVertical: 10 },
  abilityIcon: { width: 32, height: 32, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  abilityName: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
