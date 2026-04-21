import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ImageBackground,
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

export default function TitleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saves, loadSave, deleteSave } = useGame();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  function handleNewGame() {
    router.push("/character-create");
  }

  function handleContinue(index: number) {
    loadSave(index);
    router.push("/game");
  }

  function formatTime(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={require("../assets/images/title_bg.png")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 40,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 20,
          },
        ]}
      >
        <View style={styles.titleBlock}>
          <Text style={[styles.subtitle, { color: colors.crimson, letterSpacing: 4 }]}>CHRONICLES OF THE</Text>
          <Text style={[styles.title, { color: colors.gold }]}>CURSED</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            The omen had no blessing. Only a story no one wrote yet.
          </Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {saves.length > 0 && (
            <View style={styles.savesSection}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SAVED GAMES</Text>
              {saves.map((save, i) => {
                const base = save.profile.playerClass.baseClassId;
                const higher = save.profile.playerClass.higherClassId;
                const classLabel = higher
                  ? higher.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                  : base.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

                return (
                  <TouchableOpacity
                    key={save.profile.id}
                    style={[styles.saveCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => handleContinue(i)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.saveInfo}>
                      <Text style={[styles.saveName, { color: colors.foreground }]}>{save.profile.name}</Text>
                      <Text style={[styles.saveClass, { color: colors.gold }]}>{classLabel} · Lv {save.profile.level}</Text>
                      <Text style={[styles.saveMeta, { color: colors.mutedForeground }]}>
                        {formatTime(save.playTimeSeconds)} played
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteSave(i)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Feather name="trash-2" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            style={[styles.newGameBtn, { backgroundColor: colors.crimson }]}
            onPress={handleNewGame}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={18} color={colors.primaryForeground} />
            <Text style={[styles.newGameText, { color: colors.primaryForeground }]}>New Game</Text>
          </TouchableOpacity>

          <View style={styles.loreQuote}>
            <Text style={[styles.quoteText, { color: colors.mutedForeground }]}>
              "The goddess smiled upon all who never questioned her. I questioned. Now I know."
            </Text>
            <Text style={[styles.quoteAuthor, { color: colors.darkGold }]}>— Cell Wall, Unknown Prison, Year of the Second Flood</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { backgroundColor: "rgba(13,10,14,0.78)" },
  content: { flex: 1, paddingHorizontal: 24 },
  titleBlock: { alignItems: "center", marginBottom: 36 },
  subtitle: { fontSize: 12, fontFamily: "Inter_700Bold", marginBottom: 4 },
  title: { fontSize: 52, fontFamily: "Inter_700Bold", letterSpacing: 6, lineHeight: 60 },
  tagline: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 10, maxWidth: 280, lineHeight: 20 },
  scroll: { flex: 1 },
  scrollContent: { gap: 16, paddingBottom: 24 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 8 },
  savesSection: { gap: 0 },
  saveCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  saveInfo: { flex: 1 },
  saveName: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  saveClass: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  saveMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  newGameBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 8,
    paddingVertical: 16,
  },
  newGameText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  loreQuote: { marginTop: 8, paddingHorizontal: 8 },
  quoteText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic", textAlign: "center" },
  quoteAuthor: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center", marginTop: 6 },
});
