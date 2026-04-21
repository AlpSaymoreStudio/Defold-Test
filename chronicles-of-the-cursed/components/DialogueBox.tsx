import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { StoryChoice, StoryNode } from "@/constants/gameData";

type DialogueBoxProps = {
  node: StoryNode;
  onChoice: (choiceId: string) => void;
  onAdvance: () => void;
};

const MOOD_COLORS = {
  neutral: "#7a6b5a",
  tense: "#c0392b",
  mysterious: "#8e44ad",
  combat: "#e74c3c",
  revelation: "#f1c40f",
  dark: "#1c2833",
};

export default function DialogueBox({ node, onChoice, onAdvance }: DialogueBoxProps) {
  const colors = useColors();
  const [displayedText, setDisplayedText] = useState("");
  const [textDone, setTextDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodColor = MOOD_COLORS[node.mood] || colors.mutedForeground;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setDisplayedText("");
    setTextDone(false);
    fadeAnim.setValue(0);
    let idx = 0;
    const full = node.dialogue;

    function tick() {
      idx++;
      setDisplayedText(full.slice(0, idx));
      if (idx < full.length) {
        const delay = full[idx - 1] === "." || full[idx - 1] === "," ? 45 : 18;
        timerRef.current = setTimeout(tick, delay);
      } else {
        setTextDone(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      }
    }

    timerRef.current = setTimeout(tick, 100);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [node.id]);

  function skipText() {
    if (!textDone) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setDisplayedText(node.dialogue);
      setTextDone(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }

  function handleChoice(choice: StoryChoice) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChoice(choice.id);
  }

  function handleAdvance() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdvance();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: moodColor + "55" }]}>
      {node.speakerName ? (
        <View style={styles.speakerRow}>
          <View style={[styles.speakerDot, { backgroundColor: moodColor }]} />
          <Text style={[styles.speakerName, { color: moodColor }]}>{node.speakerName}</Text>
          {node.speakerRole ? (
            <Text style={[styles.speakerRole, { color: colors.mutedForeground }]}> — {node.speakerRole}</Text>
          ) : null}
        </View>
      ) : null}

      <TouchableOpacity onPress={skipText} activeOpacity={0.9}>
        <Text style={[styles.dialogue, { color: colors.foreground }]}>{displayedText}</Text>
      </TouchableOpacity>

      {textDone && (
        <Animated.View style={{ opacity: fadeAnim }}>
          {node.choices && node.choices.length > 0 ? (
            <View style={styles.choices}>
              {node.choices.map((choice) => (
                <TouchableOpacity
                  key={choice.id}
                  style={[styles.choiceBtn, { borderColor: colors.border, backgroundColor: colors.muted }]}
                  onPress={() => handleChoice(choice)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.choiceText, { color: colors.foreground }]}>{choice.text}</Text>
                  <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
          ) : node.nextNodeId ? (
            <TouchableOpacity style={styles.advanceBtn} onPress={handleAdvance} activeOpacity={0.75}>
              <Text style={[styles.advanceText, { color: colors.mutedForeground }]}>Continue</Text>
              <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : node.isChapterEnd ? (
            <View style={styles.chapterEndBadge}>
              <Feather name="bookmark" size={14} color={colors.gold} />
              <Text style={[styles.chapterEndText, { color: colors.gold }]}>Chapter End</Text>
            </View>
          ) : null}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  speakerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  speakerDot: { width: 8, height: 8, borderRadius: 4 },
  speakerName: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  speakerRole: { fontSize: 12, fontFamily: "Inter_400Regular" },
  dialogue: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24 },
  choices: { gap: 8 },
  choiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  choiceText: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1, marginRight: 8 },
  advanceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingTop: 4,
  },
  advanceText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  chapterEndBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    paddingTop: 4,
  },
  chapterEndText: { fontSize: 13, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
});
