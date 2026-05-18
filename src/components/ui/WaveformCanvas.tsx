import React from 'react';
import { Dimensions } from 'react-native';
import { Canvas, Path, LinearGradient, vec, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { useRecordingStore } from '@/stores/recordingStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CANVAS_WIDTH = SCREEN_WIDTH * 0.6;  // ~60% screen width per D-08
const CANVAS_HEIGHT = 80;                 // UI-SPEC §7.3

interface WaveformCanvasProps {
  /** Shared value amplitude buffer — updated every frame by useAudioCapture hook */
  amplitudes: SharedValue<number[]>;
}

export function WaveformCanvas({ amplitudes }: WaveformCanvasProps) {
  const { isRecording } = useRecordingStore();

  // Derive path from amplitude buffer on UI thread via worklet
  const path = useDerivedValue(() => {
    'worklet';
    const skPath = Skia.Path.Make();
    const amp = amplitudes.value;
    if (!amp || amp.length < 2) return skPath;

    const midY = CANVAS_HEIGHT / 2;
    const stepX = CANVAS_WIDTH / (amp.length - 1);

    // Start at left edge, mid-point
    skPath.moveTo(0, midY);

    // Draw amplitude curve as connected lines (smooth path per D-07)
    for (let i = 0; i < amp.length; i++) {
      const x = i * stepX;
      // Map amplitude (0-1) to 80% of canvas height, centered vertically
      const y = midY - (amp[i] * midY * 0.8);
      skPath.lineTo(x, y);
    }

    // Close the path to create a filled shape: right edge → baseline → start
    skPath.lineTo(CANVAS_WIDTH, midY);
    skPath.lineTo(0, midY);
    skPath.close();

    return skPath;
  }, [amplitudes]);

  if (!isRecording) return null;

  return (
    <Canvas style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
      {/* Gradient-filled amplitude path (D-07, D-09) */}
      <Path path={path} style="fill">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, CANVAS_HEIGHT)}
          colors={['rgba(255, 107, 158, 1)', 'rgba(255, 107, 158, 0.3)']}
        />
      </Path>
    </Canvas>
  );
}
