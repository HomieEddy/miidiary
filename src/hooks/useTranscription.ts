import { useCallback } from 'react';
import { transcriptionService } from '@/services/transcriptionService';
import { useRecordingStore } from '@/stores/recordingStore';
import { audioCaptureService } from '@/services/audioCaptureService';
import { entriesRepository } from '@/services/entriesRepository';

interface UseTranscriptionResult {
  processRecording: (audioUri: string) => Promise<void>;
}

function resolveErrorDetail(err: unknown): string {
  if (err instanceof Error) {
    const candidate = err.message.trim();
    if (candidate.length > 1 && /[A-Za-z0-9]/.test(candidate)) {
      return candidate;
    }
    if (err.name && err.name !== 'Error') {
      return err.name;
    }
    return 'Unknown error';
  }

  if (typeof err === 'string') {
    const candidate = err.trim();
    if (candidate.length > 1 && /[A-Za-z0-9]/.test(candidate)) {
      return candidate;
    }
  }

  return 'Unknown error';
}

export function useTranscription(): UseTranscriptionResult {
  const setError = useRecordingStore((state) => state.setError);
  const setProcessing = useRecordingStore((state) => state.setProcessing);
  const setProcessingStage = useRecordingStore((state) => state.setProcessingStage);

  const processRecording = useCallback(async (audioUri: string) => {
    try {
      const result = await transcriptionService.transcribeAudio({
        audioUri,
        onStageChange: ({ stage }) => {
          setProcessingStage(stage);
        },
      });

      await entriesRepository.createEntry({
        text: result.text,
        category: 'note',
        createdAt: new Date().toISOString(),
      });

      setProcessingStage('finalizing');
      setProcessing(false);

      try {
        const tempPath = audioCaptureService.getTempFilePath();
        if (tempPath && tempPath !== audioUri) {
          await audioCaptureService.cleanupTempFile(tempPath);
        }
      } catch { /* best-effort */ }
    } catch (err) {
      setProcessingStage('idle');
      setProcessing(false);
      const message = resolveErrorDetail(err);
      setError(`Transcription failed: ${message}`);
    }
  }, [setProcessing, setProcessingStage, setError]);

  return { processRecording };
}
