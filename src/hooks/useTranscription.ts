import { useCallback } from 'react';
import { transcriptionService } from '@/services/transcriptionService';
import { classificationService } from '@/services/classificationService';
import { useRecordingStore } from '@/stores/recordingStore';
import { useEntriesStore } from '@/stores/entriesStore';
import { audioCaptureService } from '@/services/audioCaptureService';
import { entriesRepository } from '@/services/entriesRepository';

interface UseTranscriptionResult {
  processRecording: (audioUri: string) => Promise<void>;
  processPendingRecordings: () => Promise<void>;
}

function resolveErrorDetail(err: unknown): string {
  if (err instanceof Error) {
    const candidate = err.message.trim();
    const normalized = candidate.toLowerCase();
    if (normalized.includes('install')) {
      return 'Whisper runtime unavailable. Rebuild the dev client and retry.';
    }
    if (candidate.length > 1 && /[A-Za-z0-9]/.test(candidate)) {
      return candidate;
    }
    if (err.name && err.name !== 'Error') {
      return err.name;
    }
    return 'Unknown error';
  }

  if (typeof err === 'object' && err !== null) {
    const candidateMessage = Reflect.get(err, 'message');
    if (typeof candidateMessage === 'string') {
      const normalized = candidateMessage.trim().toLowerCase();
      if (normalized.includes('install')) {
        return 'Whisper runtime unavailable. Rebuild the dev client and retry.';
      }

      if (candidateMessage.trim().length > 1 && /[A-Za-z0-9]/.test(candidateMessage)) {
        return candidateMessage.trim();
      }
    }

    const code = Reflect.get(err, 'code');
    if (typeof code === 'string' && code.trim().length > 0) {
      return `Code: ${code.trim()}`;
    }

    const description = Reflect.get(err, 'description');
    if (typeof description === 'string' && description.trim().length > 1) {
      return description.trim();
    }
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
  const addPersistedEntry = useEntriesStore((state) => state.addPersistedEntry);

  const processRecording = useCallback(async (audioUri: string) => {
    try {
      let result: Awaited<ReturnType<typeof transcriptionService.transcribeAudio>>;
      try {
        result = await transcriptionService.transcribeAudio({
          audioUri,
          onStageChange: ({ stage }) => {
            setProcessingStage(stage);
          },
        });
      } catch (error) {
        throw new Error(`Transcription failed: ${resolveErrorDetail(error)}`);
      }

      setProcessingStage('classifying');
      let classification: Awaited<ReturnType<typeof classificationService.classifyEntry>>;
      try {
        classification = await classificationService.classifyEntry({
          text: result.text,
        });
      } catch (error) {
        throw new Error(`Classification failed: ${resolveErrorDetail(error)}`);
      }

      setProcessingStage('persisting');
      try {
        const entry = await entriesRepository.createEntry({
          text: result.text,
          category: classification.category,
          classification,
          createdAt: new Date().toISOString(),
        });
        addPersistedEntry({
          id: entry.id,
          text: entry.text,
          category: entry.category,
          createdAt: entry.createdAt,
        });
      } catch (error) {
        throw new Error(`Save failed: ${resolveErrorDetail(error)}`);
      }

      setProcessingStage('finalizing');
      setProcessing(false);

      try {
        const cleanupTargets = new Set<string>();
        cleanupTargets.add(audioUri);
        const tempPath = audioCaptureService.getTempFilePath();
        if (tempPath) {
          cleanupTargets.add(tempPath);
        }

        for (const target of cleanupTargets) {
          await audioCaptureService.cleanupTempFile(target);
        }
      } catch { /* best-effort */ }
    } catch (err) {
      setProcessingStage('idle');
      setProcessing(false);
      const message = resolveErrorDetail(err);
      setError(message);
    } finally {
      audioCaptureService.markProcessingComplete(audioUri);
    }
  }, [addPersistedEntry, setProcessing, setProcessingStage, setError]);

  const processPendingRecordings = useCallback(async () => {
    const pendingUris = audioCaptureService.getPendingProcessingUris();

    for (const uri of pendingUris) {
      await processRecording(uri);
    }
  }, [processRecording]);

  return { processRecording, processPendingRecordings };
}
