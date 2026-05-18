import { View, Text } from "react-native";

export default function DiaryScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center p-6">
      <Text className="font-heading text-4xl text-foreground tracking-wide">
        Diary
      </Text>
      <Text className="font-sans text-base text-muted-foreground mt-4 text-center">
        Your personal timeline of thoughts and memories. Coming soon.
      </Text>
    </View>
  );
}
