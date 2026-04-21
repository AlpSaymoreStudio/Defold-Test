import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { BaseClass } from "@/constants/gameData";

type ClassCardProps = {
  cls: BaseClass;
  selected: boolean;
  onSelect: (id: string) => void;
};

export default function ClassCard({ cls, selected, onSelect }: ClassCardProps) {
  const colors = useColors();
  const scale = React.useRef(new Animated.Value(1)).current;

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onSelect(cls.id);
  }

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
        <View style={[styles.iconWrap, { backgroundColor: cls.color + "22" }]}>
          <Feather name={cls.icon as any} size={20} color={cls.color} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.name, { color: selected ? cls.color : colors.foreground }]}>{cls.name}</Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>{cls.description}</Text>
        </View>
        {selected && (
          <Feather name="check-circle" size={18} color={cls.color} style={styles.check} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 8,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  name: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 2 },
  desc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
  check: { marginLeft: 4 },
});
