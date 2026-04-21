import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { PlayerStats, UniqueStatKey } from "@/constants/gameData";

type StatRowProps = {
  label: string;
  value: number;
  max?: number;
  color: string;
  compact?: boolean;
};

function StatRow({ label, value, max = 30, color, compact }: StatRowProps) {
  const colors = useColors();
  const pct = Math.min(value / max, 1);

  if (compact) {
    return (
      <View style={styles.statRowCompact}>
        <Text style={[styles.statLabelCompact, { color: colors.mutedForeground }]}>{label}</Text>
        <View style={[styles.barBgCompact, { backgroundColor: colors.muted }]}>
          <View style={[styles.barFillCompact, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
        </View>
        <Text style={[styles.statValueCompact, { color }]}>{value}</Text>
      </View>
    );
  }

  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
        <View style={[styles.barFill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

type StatsBarProps = {
  stats: PlayerStats;
  uniqueStatKey?: UniqueStatKey;
  uniqueStatName?: string;
  compact?: boolean;
};

export default function StatsBar({ stats, uniqueStatKey, uniqueStatName, compact }: StatsBarProps) {
  const colors = useColors();

  const statDefs = [
    { key: "strength", label: "STR", color: colors.statStr },
    { key: "mana", label: "MNA", color: colors.statMana },
    { key: "accuracy", label: "ACC", color: colors.statAcc },
    { key: "defense", label: "DEF", color: colors.statDef },
    { key: "agility", label: "AGI", color: colors.statAgi },
  ];

  return (
    <View style={styles.container}>
      {statDefs.map((s) => (
        <StatRow
          key={s.key}
          label={s.label}
          value={(stats as Record<string, number>)[s.key] ?? 0}
          color={s.color}
          compact={compact}
        />
      ))}
      {uniqueStatKey && uniqueStatName && (stats as Record<string, number>)[uniqueStatKey] !== undefined && (
        <StatRow
          key={uniqueStatKey}
          label={uniqueStatName.toUpperCase().slice(0, 4)}
          value={(stats as Record<string, number>)[uniqueStatKey] ?? 0}
          color={colors.statUnique}
          compact={compact}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", width: 34, letterSpacing: 0.5 },
  barBg: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  statValue: { fontSize: 12, fontFamily: "Inter_700Bold", width: 26, textAlign: "right" },
  statRowCompact: { flexDirection: "row", alignItems: "center", gap: 6 },
  statLabelCompact: { fontSize: 10, fontFamily: "Inter_600SemiBold", width: 28, letterSpacing: 0.5 },
  barBgCompact: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  barFillCompact: { height: "100%", borderRadius: 2 },
  statValueCompact: { fontSize: 11, fontFamily: "Inter_700Bold", width: 22, textAlign: "right" },
});
