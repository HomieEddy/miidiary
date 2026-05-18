import { useCallback } from 'react';
import { stubTranscription } from '@/services/transcriptionStub';
import { useEntriesStore } from '@/stores/entriesStore';
import { useRecordingStore } from '@/stores/recordingStore';
import { audioCaptureService } from '@/services/audioCaptureService';

export function useTranscription() {
  const { setProcessing, setError, setStatus } = useRecordingStore();
  const addEntry = useEntriesStore((s) => s.addEntry);

  const processRecording = useCallback(async (audioUri: string) => {
    try {
      const text = await stubTranscription(audioUri);

      addEntry({
        text,
        category: 'note',
        createdAt: new Date().toISOString(),
      });

      try {
        const tempPath = audioCaptureService.getTempFilePath();
        if (tempPath && tempPath !== audioUri) {
          await audioCaptureService.cleanupTempFile(tempPath);
        }
      } catch { /* best-effort */ }
    } catch (err) {
      setError('Transcription failed');
      setProcessing(false);
    }
  }, [addEntry, setProcessing, setError]);

  return { processRecording };
}
