import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { HigherClass } from "@/constants/gameData";

type HigherClassCardProps = {
  cls: HigherClass;
  selected: boolean;
  onSelect: (id: string) => void;
};

export default function HigherClassCard({ cls, selected, onSelect }: HigherClassCardProps) {
  const colors = useColors();
  const scale = React.useRef(new Animated.Value(1)).current;

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onSelect(cls.id);
  }

  const bonuses = Object.entries(cls.statBonus)
    .filter(([, v]) => v !== undefined && v !== 0)
    .map(([k, v]) => `${v! > 0 ? "+" : ""}${v} ${k.slice(0, 3).toUpperCase()}`);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: selected ? colors.card : colors.muted,
            borderColor: selected ? cls.color : colors.border,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={[styles.header, { borderBottomColor: cls.color + "33" }]}>
          <Text style={[styles.name, { color: selected ? cls.color : colors.foreground }]}>{cls.name}</Text>
          {selected && <Feather name="check-circle" size={16} color={cls.color} />}
        </View>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>{cls.description}</Text>
        <Text style={[styles.lore, { color: colors.mutedForeground + "bb" }]} numberOfLines={2}>{cls.lore}</Text>

        <View style={styles.bonusRow}>
          {bonuses.map((b, i) => (
            <View key={i} style={[styles.bonusBadge, { backgroundColor: cls.color + "22", borderColor: cls.color + "44" }]}>
              <Text style={[styles.bonusText, { color: cls.color }]}>{b}</Text>
            </View>
          ))}
        </View>

        {cls.uniqueStat && (
          <View style={[styles.uniqueRow, { backgroundColor: colors.accent + "22", borderColor: colors.accent + "44" }]}>
            <Feather name="zap" size={12} color={colors.accent} />
            <Text style={[styles.uniqueLabel, { color: colors.accent }]}>Unique: </Text>
            <Text style={[styles.uniqueName, { color: colors.accentForeground }]}>{cls.uniqueStat.name}</Text>
          </View>
        )}

        <View style={styles.abilities}>
          {cls.abilities.map((a, i) => (
            <Text key={i} style={[styles.ability, { color: colors.mutedForeground }]}>· {a}</Text>
          ))}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 16,
    gap: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  name: { fontSize: 17, fontFamily: "Inter_700Bold" },
  desc: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  lore: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  bonusRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  bonusBadge: { borderRadius: 4, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  bonusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  uniqueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  uniqueLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  uniqueName: { fontSize: 12, fontFamily: "Inter_700Bold" },
  abilities: { gap: 2 },
  ability: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
