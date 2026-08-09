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
    // The session this recording belongs to is captured at stop time and
    // carried on the pending URI. If the user starts a new recording while
    // this one is still processing, its completion must NOT touch the live
    // session's store state (status/stage/error).
    const sessionId =
      audioCaptureService.getRecordingSessionId(audioUri) ??
      useRecordingStore.getState().sessionId;
    const isCurrentSession = () => useRecordingStore.getState().sessionId === sessionId;

    let persisted = false;

    try {
      let result: Awaited<ReturnType<typeof transcriptionService.transcribeAudio>>;
      try {
        result = await transcriptionService.transcribeAudio({
          audioUri,
          onStageChange: ({ stage }) => {
            if (isCurrentSession()) {
              setProcessingStage(stage);
            }
          },
        });
      } catch (error) {
        throw new Error(`Transcription failed: ${resolveErrorDetail(error)}`);
      }

      if (isCurrentSession()) {
        setProcessingStage('classifying');
      }
      let classification: Awaited<ReturnType<typeof classificationService.classifyEntry>>;
      try {
        classification = await classificationService.classifyEntry({
          text: result.text,
        });
      } catch (error) {
        throw new Error(`Classification failed: ${resolveErrorDetail(error)}`);
      }

      if (isCurrentSession()) {
        setProcessingStage('persisting');
      }
      try {
        const entry = await entriesRepository.createEntry({
          text: result.text,
          category: classification.category,
          classification,
          createdAt: new Date().toISOString(),
        });
        persisted = true;
        addPersistedEntry({
          id: entry.id,
          text: entry.text,
          category: entry.category,
          createdAt: entry.createdAt,
        });
      } catch (error) {
        throw new Error(`Save failed: ${resolveErrorDetail(error)}`);
      }

      if (isCurrentSession()) {
        setProcessingStage('finalizing');
        setProcessing(false);
      }

      // Clean up ONLY this recording's own file. The service's shared temp
      // path is off-limits here: it may already point at a newer recording.
      try {
        await audioCaptureService.cleanupTempFile(audioUri);
      } catch { /* best-effort */ }
    } catch (err) {
      if (isCurrentSession()) {
        setProcessingStage('idle');
        setProcessing(false);
        const message = resolveErrorDetail(err);
        setError(message);
      }
      // Failure: keep the URI pending so a later replay (next launch,
      // AppState resume) can retry it. Do NOT drop the recording.
    } finally {
      if (persisted) {
        audioCaptureService.markProcessingComplete(audioUri);
      }
    }
  }, [addPersistedEntry, setProcessing, setProcessingStage, setError]);

  const processPendingRecordings = useCallback(async () => {
    const pendingUris = audioCaptureService.getPendingProcessingUris();

    for (const uri of pendingUris) {
      if (inFlightReplay.has(uri)) {
        // Another trigger (mount, AppState, background task) is already
        // processing this URI — skip to avoid duplicate persisted entries.
        continue;
      }
      inFlightReplay.add(uri);
      try {
        await processRecording(uri);
      } finally {
        inFlightReplay.delete(uri);
      }
    }
  }, [processRecording]);

  return { processRecording, processPendingRecordings };
}

/** URIs currently being replayed, shared across hook instances so mount,
 *  AppState-active and background-task triggers cannot double-persist. */
const inFlightReplay = new Set<string>();
