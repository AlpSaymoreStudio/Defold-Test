import React, { useRef } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type JoystickProps = {
  size?: number;
  onMove: (dx: number, dy: number) => void;
  onRelease: () => void;
};

const STICK_RADIUS = 36;

export default function VirtualJoystick({ size = 110, onMove, onRelease }: JoystickProps) {
  const colors = useColors();
  const center = size / 2;
  const stickPos = useRef({ x: center, y: center });
  const stickViewRef = useRef<View>(null);
  const baseRef = useRef({ px: 0, py: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        baseRef.current = { px: e.nativeEvent.pageX, py: e.nativeEvent.pageY };
      },
      onPanResponderMove: (_, gs) => {
        const maxR = center - STICK_RADIUS;
        const rawX = gs.dx;
        const rawY = gs.dy;
        const dist = Math.sqrt(rawX * rawX + rawY * rawY);
        const clamp = Math.min(dist, maxR);
        const angle = Math.atan2(rawY, rawX);
        const sx = clamp * Math.cos(angle);
        const sy = clamp * Math.sin(angle);

        stickPos.current = { x: center + sx, y: center + sy };
        stickViewRef.current?.setNativeProps({
          style: { left: center + sx - STICK_RADIUS, top: center + sy - STICK_RADIUS },
        });

        const ndx = dist > 6 ? sx / maxR : 0;
        const ndy = dist > 6 ? sy / maxR : 0;
        onMove(ndx, ndy);
      },
      onPanResponderRelease: () => {
        stickPos.current = { x: center, y: center };
        stickViewRef.current?.setNativeProps({
          style: { left: center - STICK_RADIUS, top: center - STICK_RADIUS },
        });
        onRelease();
      },
      onPanResponderTerminate: () => {
        stickPos.current = { x: center, y: center };
        stickViewRef.current?.setNativeProps({
          style: { left: center - STICK_RADIUS, top: center - STICK_RADIUS },
        });
        onRelease();
      },
    })
  ).current;

  return (
    <View
      style={[styles.base, { width: size, height: size, borderRadius: size / 2, borderColor: colors.border + "99", backgroundColor: colors.muted + "55" }]}
      {...panResponder.panHandlers}
    >
      <View
        ref={stickViewRef}
        style={[
          styles.stick,
          {
            left: center - STICK_RADIUS,
            top: center - STICK_RADIUS,
            width: STICK_RADIUS * 2,
            height: STICK_RADIUS * 2,
            borderRadius: STICK_RADIUS,
            backgroundColor: colors.crimson + "cc",
            borderColor: colors.gold + "88",
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    position: "relative",
  },
  stick: {
    position: "absolute",
    borderWidth: 2,
  },
});
