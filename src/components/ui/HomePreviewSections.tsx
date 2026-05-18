import type { ReactElement } from 'react';
import { Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  BookBookmarkBold,
  BoxMinimalisticBoldDuotone,
  CheckSquareBold,
  HomeSmileBoldDuotone,
} from '@/assets/icons/solar';
import { useEntriesStore, type Entry, type EntryCategory } from '@/stores/entriesStore';
import { colors } from '@/theme/colors';
import { cn } from '@/utils/cn';

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
  const entries = useEntriesStore((state) => state.entries);
  const recentEntries = entries.slice(0, 3);

  return (
    <View className="px-6 gap-10">
      <View>
        <SectionHeader title="Fresh Thoughts" icon={BookBookmarkBold} color={colors.accent} />
        {recentEntries.length > 0 ? <EntryList entries={recentEntries} /> : (
          <EmptyState
            icon={BookBookmarkBold}
            iconColor={colors.accent}
            title="No thoughts yet"
            body="Record your first thought and it will appear here."
          />
        )}
      </View>

      <View>
        <SectionHeader title="Recent Digests" icon={BoxMinimalisticBoldDuotone} color={digestIconColor} />
        <EmptyState
          icon={BoxMinimalisticBoldDuotone}
          iconColor={digestIconColor}
          title="Digests will appear here"
          body="Weekly and monthly reflections unlock after browse and review features land."
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
  const config = categoryConfig[entry.category];

  return (
    <View
      className={cn(
        'bg-card border-4 border-border rounded-2xl p-4 shadow-paper relative',
        index % 2 === 0 ? 'rotate-1' : '-rotate-1'
      )}
    >
      <View className="absolute -top-3 -right-2">
        <View className={cn('flex-row items-center gap-1 px-3 py-1.5 border-2 border-border rounded-full shadow-paper-sm', config.badgeClassName)}>
          <SvgXml xml={config.icon} color={config.iconColor} width={14} height={14} />
          <Text className="text-[10px] uppercase tracking-wider font-bold">
            {config.label}
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
  );
}

interface EmptyStateProps {
  body: string;
  icon: string;
  iconColor: string;
  title: string;
}

function EmptyState({ body, icon, iconColor, title }: EmptyStateProps): ReactElement {
  return (
    <View className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper">
      <View className="flex-row items-start gap-3">
        <View className="w-10 h-10 bg-muted rounded-xl border-2 border-border items-center justify-center">
          <SvgXml xml={icon} color={iconColor} width={24} height={24} />
        </View>
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
  );
}

function formatEntryTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Just now';
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
    <View className="flex-row items-center justify-between mb-5">
      <Text className="font-heading text-2xl tracking-wide text-foreground">
        {title}
      </Text>
      <View className="bg-card border-2 border-border p-2 rounded-xl shadow-paper-sm">
        <SvgXml xml={icon} color={color} width={24} height={24} />
      </View>
    </View>
  );
}
