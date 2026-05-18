import { View, Text } from 'react-native';
import { GlowRing } from '@/components/ui/GlowRing';
import { RecorderButton } from '@/components/ui/RecorderButton';
import { RecordingTimer } from '@/components/ui/RecordingTimer';
import { PromptText } from '@/components/ui/PromptText';
import { useRecordingStore } from '@/stores/recordingStore';
import { audioCaptureService } from '@/services/audioCaptureService';
import { useInterruptionHandler } from '@/services/interruptionService';

export default function HomeScreen() {
  const {
    isRecording,
    isProcessing,
    setRecording,
    setProcessing,
    setError,
    setMetering,
  } = useRecordingStore();

  useInterruptionHandler();

  const handleStartRecording = async () => {
    setRecording(true);
    audioCaptureService.onMetering((value: number) => {
      setMetering(value);
    });
    const success = await audioCaptureService.startRecording();
    if (!success) {
      setRecording(false);
      setError('Recording failed');
    }
  };

  const handleStopRecording = async () => {
    const uri = await audioCaptureService.stopRecording();
    if (uri) {
      setRecording(false);
      setProcessing(true);
      // Plan 01-02: transcription stub will be wired here via useTranscription hook
      // For now, mark processing as complete immediately
      setProcessing(false);
    } else {
      setError('Recording failed');
    }
  };

  return (
    <View className="flex-1 bg-background pb-16">
      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center justify-center mb-6">
          <GlowRing isActive={isRecording} />
          <RecorderButton
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
        </View>

        <View className="mb-8">
          <PromptText />
        </View>

        <View className="mb-8">
          <RecordingTimer />
        </View>

        <View className="h-20 self-center justify-center">
          {isRecording && (
            <Text className="font-sans text-sm text-muted-foreground text-center">
              Waveform coming in next phase
            </Text>
          )}
        </View>

        <View className="mt-4">
          {isProcessing && (
            <View className="bg-muted/50 rounded-2xl px-6 py-4 self-center">
              <Text className="font-sans text-base text-muted-foreground">
                Processing transcription...
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
