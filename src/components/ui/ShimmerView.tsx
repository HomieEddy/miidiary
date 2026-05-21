import type { ReactElement } from "react";
import { View } from "react-native";
import { cn } from "@/utils/cn";

export function ShimmerView({ className }: { className?: string }): ReactElement {
  return <View className={cn("bg-muted/70 rounded-xl", className)} />;
}
