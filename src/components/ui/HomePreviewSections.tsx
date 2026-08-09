import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { AnimatedEntrance } from '@/components/ui/AnimatedEntrance';
import {
  BookBookmarkBold,
  BoxMinimalisticBoldDuotone,
  CheckSquareBold,
  HomeSmileBoldDuotone,
} from '@/assets/icons/solar';
import { i18n, useLocale } from '@/i18n';
import { useEntriesStore, type Entry, type EntryCategory } from '@/stores/entriesStore';
import { colors } from '@/theme/colors';
import { cn } from '@/utils/cn';
import { springs, staggerMs } from '@/utils/motion';

const categoryConfig: Record<EntryCategory, {
  badgeClassName: string;
  icon: string;
  iconColor: string;
  label: string;
}> = {
  diary: {
    badgeClassName: 'bg-primary text-primary-foreground',
    icon: BookBookmarkBold,
    iconColor: colors.primaryForeground,
    label: 'Diary',
  },
  task: {
    badgeClassName: 'bg-secondary text-secondary-foreground',
    icon: CheckSquareBold,
    iconColor: colors.secondaryForeground,
    label: 'Task',
  },
  note: {
    badgeClassName: 'bg-accent text-accent-foreground',
    icon: HomeSmileBoldDuotone,
    iconColor: colors.accentForeground,
    label: 'Note',
  },
};

const digestIconColor = '#118AB2';

export function HomePreviewSections(): ReactElement {
  const { t } = useLocale();
  const entries = useEntriesStore((state) => state.entries);
  const recentEntries = entries.slice(0, 3);

  return (
    <View className="px-6 gap-10">
      <View>
        <SectionHeader title={t("home.freshThoughts")} icon={BookBookmarkBold} color={colors.accent} />
        {recentEntries.length > 0 ? <EntryList entries={recentEntries} /> : (
          <EmptyState
            icon={BookBookmarkBold}
            iconColor={colors.accent}
            title={t("home.noThoughtsTitle")}
            body={t("home.noThoughtsBody")}
          />
        )}
      </View>

      <View>
        <SectionHeader title={t("home.recentDigests")} icon={BoxMinimalisticBoldDuotone} color={digestIconColor} />
        <EmptyState
          icon={BoxMinimalisticBoldDuotone}
          iconColor={digestIconColor}
          title={t("home.digestsTitle")}
          body={t("home.digestsBody")}
        />
      </View>
    </View>
  );
}

interface EntryListProps {
  entries: Entry[];
}

function EntryList({ entries }: EntryListProps): ReactElement {
  return (
    <View className="gap-4">
      {entries.map((entry, index) => (
        <EntryCard entry={entry} index={index} key={entry.id} />
      ))}
    </View>
  );
}

interface EntryCardProps {
  entry: Entry;
  index: number;
}

function EntryCard({ entry, index }: EntryCardProps): ReactElement {
  const { t } = useLocale();
  // Fall back to the note config so an unexpected/unmigrated category
  // value renders instead of throwing on the deref below.
  const config = categoryConfig[entry.category] ?? categoryConfig.note;
  const categoryLabel: Record<EntryCategory, string> = {
    diary: t("sheet.categoryDiary"),
    task: t("sheet.categoryTask"),
    note: t("sheet.categoryNote"),
  };

  return (
    <AnimatedEntrance delay={index * staggerMs}>
      <View
        className={cn(
          'bg-card border-4 border-border rounded-2xl p-4 shadow-paper relative',
          index % 2 === 0 ? 'rotate-1' : '-rotate-1'
        )}
      >
        <View className="absolute -top-3 -right-2">
          <View className={cn('flex-row items-center gap-1 px-3 py-1.5 border-2 border-border rounded-full shadow-paper-sm', config.badgeClassName)}>
            <SvgXml xml={config.icon} color={config.iconColor} width={14} height={14} />
            <Text className="text-xs uppercase tracking-wider font-bold">
              {categoryLabel[entry.category]}
            </Text>
          </View>
        </View>
        <Text className="font-medium text-foreground pr-16 text-base">
          {entry.text}
        </Text>
        <Text className="text-xs text-muted-foreground mt-3 font-bold">
          {formatEntryTime(entry.createdAt)}
        </Text>
      </View>
    </AnimatedEntrance>
  );
}

interface EmptyStateProps {
  body: string;
  icon: string;
  iconColor: string;
  title: string;
}

function EmptyState({ body, icon, iconColor, title }: EmptyStateProps): ReactElement {
  const iconScale = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      // Reduced motion: icon visible, no bounce.
      iconScale.value = 1;
      return;
    }

    iconScale.value = withDelay(120, withSpring(1, springs.elastic));
  }, [iconScale, reducedMotion]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <AnimatedEntrance delay={60}>
      <View className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper">
        <View className="flex-row items-start gap-3">
          <Animated.View
            className="w-10 h-10 bg-muted rounded-xl border-2 border-border items-center justify-center"
            style={iconStyle}
          >
            <SvgXml xml={icon} color={iconColor} width={24} height={24} />
          </Animated.View>
          <View className="flex-1">
            <Text className="font-heading text-lg text-foreground">
              {title}
            </Text>
            <Text className="font-sans text-sm text-muted-foreground mt-1">
              {body}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedEntrance>
  );
}

function formatEntryTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return i18n.t('diary.justNow');
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  }).format(date);
}

interface SectionHeaderProps {
  color: string;
  icon: string;
  title: string;
}

function SectionHeader({ color, icon, title }: SectionHeaderProps): ReactElement {
  return (
    <AnimatedEntrance className="mb-5">
      <View className="flex-row items-center justify-between">
        <Text className="font-heading text-2xl tracking-wide text-foreground">
          {title}
        </Text>
        <View className="bg-card border-2 border-border p-2 rounded-xl shadow-paper-sm">
          <SvgXml xml={icon} color={color} width={24} height={24} />
        </View>
      </View>
    </AnimatedEntrance>
  );
}
