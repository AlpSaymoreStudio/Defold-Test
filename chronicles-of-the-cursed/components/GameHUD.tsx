import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type GameHUDProps = {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  kills: number;
  playerClass: string;
  xp: number;
  xpToNext: number;
};

export default function GameHUD({ hp, maxHp, mp, maxMp, level, kills, playerClass, xp, xpToNext }: GameHUDProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const hpPct = Math.max(0, hp / maxHp);
  const mpPct = Math.max(0, mp / maxMp);
  const xpPct = Math.min(xp / xpToNext, 1);

  const hpColor = hpPct > 0.5 ? "#27ae60" : hpPct > 0.25 ? "#e67e22" : "#c0392b";

  return (
    <View style={[styles.container, { paddingTop: topPad + 6 }]}>
      <View style={[styles.panel, { backgroundColor: "rgba(13,10,14,0.88)", borderColor: colors.border + "88" }]}>
        <View style={styles.classRow}>
          <Text style={[styles.classLabel, { color: colors.gold }]}>{playerClass.toUpperCase()}</Text>
          <Text style={[styles.levelText, { color: colors.crimson }]}>Lv {level}</Text>
          <Text style={[styles.killText, { color: colors.mutedForeground }]}>⚔ {kills}</Text>
        </View>

        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: "#c0392b" }]}>HP</Text>
          <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
            <View style={[styles.barFill, { width: `${hpPct * 100}%` as any, backgroundColor: hpColor }]} />
          </View>
          <Text style={[styles.barVal, { color: colors.foreground }]}>{Math.ceil(hp)}/{maxHp}</Text>
        </View>

        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: "#3498db" }]}>MP</Text>
          <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
            <View style={[styles.barFill, { width: `${mpPct * 100}%` as any, backgroundColor: "#3498db" }]} />
          </View>
          <Text style={[styles.barVal, { color: colors.foreground }]}>{Math.ceil(mp)}/{maxMp}</Text>
        </View>

        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: colors.gold }]}>XP</Text>
          <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
            <View style={[styles.barFill, { width: `${xpPct * 100}%` as any, backgroundColor: colors.gold }]} />
          </View>
          <Text style={[styles.barVal, { color: colors.mutedForeground }]}>{xp}/{xpToNext}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 100,
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 5,
  },
  classRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 2 },
  classLabel: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1, flex: 1 },
  levelText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  killText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  barLabel: { fontSize: 10, fontFamily: "Inter_700Bold", width: 22 },
  barBg: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
  barVal: { fontSize: 10, fontFamily: "Inter_500Medium", width: 52, textAlign: "right" },
});
