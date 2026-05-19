import { File } from 'expo-file-system';

/**
 * Simulates transcription with 1-3s delay, then cleans up the audio file.
 * Returns placeholder text. Phase 3 replaces this with actual STT.
 *
 * @param audioUri - Path to the temp WAV file to transcribe (and then delete)
 * @returns Promise resolving to placeholder transcription text
 */
export async function stubTranscription(audioUri: string): Promise<string> {
  // Simulate 1-3s processing delay (D-12)
  const delay = 1000 + Math.random() * 2000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Audio cleanup: delete temp file immediately after stub (VOIC-07, D-01 ephemeral requirement)
  try {
    const file = new File(audioUri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Best-effort cleanup — file may have been cleaned up already
  }

  return 'This is a simulated transcription. Actual STT arrives in Phase 3.';
}
