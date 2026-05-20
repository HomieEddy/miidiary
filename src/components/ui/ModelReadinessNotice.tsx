import type { ReactElement } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors } from '@/theme/colors';

type ModelReadinessNoticeProps = {
  errorMessage: string | null;
  state: 'loading' | 'ready' | 'error';
};

const WARNING_ICON = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 7.75a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 .75-.75zM12 16.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" fill="currentColor"/><path d="M2.4 19.5 11 4.8a1.15 1.15 0 0 1 2 0l8.6 14.7a1.15 1.15 0 0 1-1 1.7H3.4a1.15 1.15 0 0 1-1-1.7z" fill="currentColor" opacity="0.25"/></svg>`;

export function ModelReadinessNotice({
  errorMessage,
  state,
}: ModelReadinessNoticeProps): ReactElement | null {
  if (state === 'ready') {
    return null;
  }

  if (state === 'error') {
    return (
      <View className="mx-6 bg-destructive/10 border-2 border-destructive rounded-2xl px-4 py-3 flex-row items-start gap-3">
        <SvgXml xml={WARNING_ICON} width={22} height={22} color={colors.destructive} />
        <View className="flex-1">
          <Text className="font-sans text-sm font-bold text-destructive">
            Voice model is not ready
          </Text>
          <Text className="font-sans text-xs font-medium text-destructive/80 mt-1">
            {errorMessage ?? 'The transcription model could not be loaded.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-6 bg-muted/50 border-2 border-border rounded-2xl px-4 py-3 flex-row items-center gap-3">
      <ActivityIndicator size="small" color={colors.primary} />
      <View className="flex-1">
        <Text className="font-sans text-sm font-bold text-foreground">
          Preparing voice model
        </Text>
        <Text className="font-sans text-xs font-medium text-muted-foreground mt-1">
          Recording will unlock when offline transcription is ready.
        </Text>
      </View>
    </View>
  );
}
