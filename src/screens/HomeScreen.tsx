import { useCallback } from 'react';
import { View } from 'react-native';
import { GlowRing } from '@/components/ui/GlowRing';
import { RecorderButton } from '@/components/ui/RecorderButton';
import { RecordingTimer } from '@/components/ui/RecordingTimer';
import { PromptText } from '@/components/ui/PromptText';
import { WaveformCanvas } from '@/components/ui/WaveformCanvas';
import { ProcessingState } from '@/components/ui/ProcessingState';
import { TranscriptionResult } from '@/components/ui/TranscriptionResult';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { useTranscription } from '@/hooks/useTranscription';

export default function HomeScreen() {
  const {
    isRecording, isProcessing, status, amplitudes,
    startRecording, stopRecording, retry,
  } = useAudioCapture();

  const { processRecording } = useTranscription();

  const handleStopRecording = useCallback(async () => {
    const uri = await stopRecording();
    if (uri) {
      processRecording(uri);
    }
  }, [stopRecording, processRecording]);

  return (
    <View className="flex-1 bg-background pb-16">
      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center justify-center mb-6">
          <GlowRing isActive={isRecording} />
          <RecorderButton
            onStartRecording={startRecording}
            onStopRecording={handleStopRecording}
          />
        </View>

        <View className="mb-8">
          <PromptText />
        </View>

        <View className="mb-4">
          <RecordingTimer />
        </View>

        {isRecording && (
          <View className="self-center mb-4">
            <WaveformCanvas amplitudes={amplitudes} />
          </View>
        )}

        <View className="mb-4">
          <ProcessingState visible={isProcessing && status !== 'recording'} />
        </View>

        <View className="mb-4">
          <TranscriptionResult
            visible={!isRecording && !isProcessing && status === 'idle'}
          />
        </View>

        <ErrorBanner
          visible={status === 'error'}
          onRetry={retry}
        />
      </View>
    </View>
  );
}

// UX-06: Shake-to-clear buffer reset — STUB (built but not active until Phase 3)
// Phase 3 activates this with expo-haptics ImpactFeedbackStyle.Heavy
// useEffect(() => {
//   // React Native shake listener subscription
//   // On shake: reset(), Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
//   // return () => unsubscription
// }, []);
