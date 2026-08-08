import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { Accelerometer } from "expo-sensors";

const SHAKE_THRESHOLD = 1.6;
const CONSECUTIVE_SAMPLES = 2;

/**
 * Accelerometer-based shake detection (UX-06): fires `onShake` when the
 * device is shaken hard enough twice in a row. Native-only — the web
 * accelerometer requires permissions the app does not request.
 */
export function useShakeToReset(onShake: () => void): void {
  const onShakeRef = useRef(onShake);
  const consecutiveRef = useRef(0);

  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    let active = true;

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude > SHAKE_THRESHOLD) {
        consecutiveRef.current += 1;
        if (consecutiveRef.current >= CONSECUTIVE_SAMPLES) {
          consecutiveRef.current = 0;
          onShakeRef.current();
        }
      } else {
        consecutiveRef.current = Math.max(0, consecutiveRef.current - 1);
      }
    });

    Accelerometer.setUpdateInterval(120);

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
}

export const shakeSupported = Platform.OS !== "web";
