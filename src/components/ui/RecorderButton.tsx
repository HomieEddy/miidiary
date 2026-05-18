import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRecordingStore } from '@/stores/recordingStore';
import { SvgXml } from 'react-native-svg';
import { colors } from '@/theme/colors';

interface RecorderButtonProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function RecorderButton({ onStartRecording, onStopRecording }: RecorderButtonProps): ReactElement {
  const scale = useSharedValue(1);
  const isProcessing = useRecordingStore((state) => state.isProcessing);
  const isRecording = useRecordingStore((state) => state.isRecording);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(async () => {
    if (isProcessing) return;

    if (!isRecording) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      scale.value = withSpring(1.15, {
        mass: 0.5,
        stiffness: 200,
        damping: 12,
      }, () => {
        scale.value = withSpring(1.0);
      });

      onStartRecording();
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      scale.value = withSpring(1.05, {
        mass: 0.5,
        stiffness: 150,
        damping: 15,
      }, () => {
        scale.value = withSpring(1.0);
      });

      onStopRecording();
    }
  }, [isRecording, isProcessing, onStartRecording, onStopRecording, scale]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={isProcessing}
      accessibilityLabel={isRecording ? 'Stop recording' : 'Record audio'}
      accessibilityHint={
        isRecording
          ? 'Double tap to stop recording'
          : 'Double tap to start recording a voice entry'
      }
      className="w-[144px] h-[144px] items-center justify-center"
    >
      <Animated.View style={buttonStyle} className="w-[144px] h-[144px]">
        <View className="w-[144px] h-[144px] rounded-full bg-card border-4 border-border" />
      </Animated.View>
      <View className="absolute" pointerEvents="none">
        <SvgXml
          xml={isRecording ? RECORDING_ICON : IDLE_ICON}
          width={72}
          height={72}
          color={colors.primary}
        />
      </View>
    </Pressable>
  );
}

const IDLE_ICON = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" fill="currentColor" opacity="0.6"/><path d="M6 11a6 6 0 0 0 12 0h2a8 8 0 0 1-7 7.93V21h-2v-2.07A8 8 0 0 1 4 11h2z" fill="currentColor"/></svg>`;

const RECORDING_ICON = `<svg viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="2" height="20" rx="1" fill="currentColor"/><rect x="13" y="4" width="2" height="16" rx="1" fill="currentColor" opacity="0.7"/><rect x="5" y="6" width="2" height="12" rx="1" fill="currentColor" opacity="0.4"/><rect x="17" y="8" width="2" height="8" rx="1" fill="currentColor" opacity="0.4"/></svg>`;
