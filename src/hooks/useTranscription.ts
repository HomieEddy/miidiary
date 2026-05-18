import { useCallback } from 'react';
import { stubTranscription } from '@/services/transcriptionStub';
import { useRecordingStore } from '@/stores/recordingStore';
import { audioCaptureService } from '@/services/audioCaptureService';
import { entriesRepository } from '@/services/entriesRepository';

interface UseTranscriptionResult {
  processRecording: (audioUri: string) => Promise<void>;
}

export function useTranscription(): UseTranscriptionResult {
  const setError = useRecordingStore((state) => state.setError);
  const setProcessing = useRecordingStore((state) => state.setProcessing);

  const processRecording = useCallback(async (audioUri: string) => {
    try {
      const text = await stubTranscription(audioUri);

      await entriesRepository.createEntry({
        text,
        category: 'note',
        createdAt: new Date().toISOString(),
      });

      setProcessing(false);

      try {
        const tempPath = audioCaptureService.getTempFilePath();
        if (tempPath && tempPath !== audioUri) {
          await audioCaptureService.cleanupTempFile(tempPath);
        }
      } catch { /* best-effort */ }
    } catch (err) {
      setProcessing(false);
      setError('Transcription failed');
    }
  }, [setProcessing, setError]);

  return { processRecording };
}
