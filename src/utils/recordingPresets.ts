import { IOSOutputFormat, AudioQuality, type RecordingOptions } from 'expo-audio';
import { Platform } from 'react-native';

const IOS_WHISPER_QUALITY: RecordingOptions = {
  extension: '.wav',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 256000,
  isMeteringEnabled: true,
  android: {
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
  },
  ios: {
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.MAX,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/wav',
    bitsPerSecond: 256000,
  },
};

const ANDROID_WHISPER_QUALITY: RecordingOptions = {
  extension: '.m4a',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 128000,
  isMeteringEnabled: true,
  android: {
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
  },
  ios: {
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.HIGH,
  },
  web: {
    mimeType: 'audio/mp4',
    bitsPerSecond: 128000,
  },
};

export const WHISPER_QUALITY: RecordingOptions =
  Platform.OS === 'android' ? ANDROID_WHISPER_QUALITY : IOS_WHISPER_QUALITY;
