import type { ReactElement } from 'react';
import { useCallback, useEffect } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { GlowRing } from '@/components/ui/GlowRing';
import { HomePreviewSections } from '@/components/ui/HomePreviewSections';
import { RecorderButton } from '@/components/ui/RecorderButton';
import { RecordingTimer } from '@/components/ui/RecordingTimer';
import { PromptText } from '@/components/ui/PromptText';
import { ProcessingState } from '@/components/ui/ProcessingState';
import { TranscriptionResult } from '@/components/ui/TranscriptionResult';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { useTranscription } from '@/hooks/useTranscription';
import {
  initializeBackgroundProcessing,
  setBackgroundProcessors,
} from '@/services/backgroundTaskService';
import { modelManager } from '@/services/modelManager';

export default function HomeScreen(): ReactElement {
  const {
    isRecording, isProcessing, status,
    startRecording, stopRecording, retry,
  } = useAudioCapture();

  const { processRecording, processPendingRecordings } = useTranscription();

  useEffect(() => {
    void processPendingRecordings();
  }, [processPendingRecordings]);

  useEffect(() => {
    setBackgroundProcessors({
      processPendingRecordings,
      syncModels: () => modelManager.syncModelsForBackground(),
    });
    void initializeBackgroundProcessing();
  }, [processPendingRecordings]);

  const handleStopRecording = useCallback(async () => {
    const uri = await stopRecording();
    if (uri) {
      processRecording(uri);
    }
  }, [stopRecording, processRecording]);

  return (
    <ScrollView className="min-h-screen bg-background text-foreground pb-32 font-sans">
      <View className="px-6 pt-12">
        <View className="relative bg-secondary border-4 border-border rounded-3xl p-6 shadow-paper -rotate-2">
          <View className="absolute -top-10 -right-4 z-10 w-20 h-20">
            <Image
              source={require('../../ui-export-react/images/tjieNgrH5Ca.png')}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <Text className="font-heading text-xl mb-1 text-secondary-foreground tracking-wide">
            Daily Spark
          </Text>
          <Text className="text-sm text-secondary-foreground font-medium">
            "What made you smile today without even trying?"
          </Text>
        </View>
      </View>

      <View className="items-center justify-center py-12">
        <View className="relative items-center justify-center">
          <GlowRing isActive={isRecording} />
          <RecorderButton
            onStartRecording={startRecording}
            onStopRecording={handleStopRecording}
          />
        </View>

        <View className="mt-10">
          <PromptText />
        </View>

        <View className="mt-4">
          <RecordingTimer />
        </View>

        <View className="mt-4">
          <ProcessingState visible={isProcessing && status !== 'recording'} />
        </View>

        <View className="mt-4 px-6">
          <TranscriptionResult
            visible={!isRecording && !isProcessing && status === 'idle'}
          />
        </View>

        <View className="mt-4 px-6 w-full">
          <ErrorBanner visible={status === 'error'} onRetry={retry} />
        </View>
      </View>

      <HomePreviewSections />
    </ScrollView>
  );
}
