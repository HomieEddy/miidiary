import { View, Text } from "react-native";

export default function TasksScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center p-6">
      <Text className="font-heading text-4xl text-foreground tracking-wide">
        Tasks
      </Text>
      <Text className="font-sans text-base text-muted-foreground mt-4 text-center">
        Your to-dos, action items, and follow-ups. Coming soon.
      </Text>
    </View>
  );
}
