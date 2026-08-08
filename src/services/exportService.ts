import { Platform } from "react-native";
import { File, Paths, writeAsStringAsync } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { entriesRepository } from "@/services/entriesRepository";

/**
 * Export the diary to JSON (native share sheet / web download) or PDF
 * (native share; web opens the print dialog). Implements EXPT-01.
 */

export interface ExportPayload {
  exportedAt: string;
  app: string;
  count: number;
  entries: {
    id: string;
    text: string;
    title: string;
    category: string;
    isCompleted: boolean;
    createdAt: string;
    updatedAt?: string;
  }[];
}

async function collectEntries(): Promise<ExportPayload> {
  const entries = await entriesRepository.listChronological();

  return {
    exportedAt: new Date().toISOString(),
    app: "Dear Diary",
    count: entries.length,
    entries: entries.map((entry) => ({
      id: entry.id,
      text: entry.text,
      title: entry.title,
      category: entry.category,
      isCompleted: entry.isCompleted ?? false,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    })),
  };
}

function exportFileName(extension: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `dear-diary-${date}.${extension}`;
}

async function shareFile(uri: string, mimeType: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType });
    return;
  }

  throw new Error("Sharing is not available on this device.");
}

export async function exportJson(): Promise<void> {
  const payload = await collectEntries();
  const json = JSON.stringify(payload, null, 2);

  if (Platform.OS === "web") {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = exportFileName("json");
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, exportFileName("json"));
  await writeAsStringAsync(file.uri, json);
  await shareFile(file.uri, "application/json");
}

export async function exportPdf(): Promise<void> {
  const payload = await collectEntries();

  const rows = payload.entries
    .map(
      (entry) => `
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #E5D9C8;">
        <div style="font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #3A3544;">${escapeHtml(entry.title)}</div>
        <div style="font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #FF6B9E; margin: 4px 0 8px;">${entry.category} · ${entry.createdAt.slice(0, 10)}</div>
        <div style="font-size: 14px; color: #2A2631; line-height: 1.5;">${escapeHtml(entry.text)}</div>
      </div>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family: Georgia, serif; color: #2A2631; padding: 24px;">
    <h1 style="font-size: 24px; color: #3A3544;">Dear Diary — ${escapeHtml(new Date().toISOString().slice(0, 10))}</h1>
    <p style="color: #8A828F; font-size: 12px;">${payload.count} ${payload.count === 1 ? "entry" : "entries"}</p>
    ${rows}
  </body>
</html>`;

  if (Platform.OS === "web") {
    await Print.printAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  await shareFile(uri, "application/pdf");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
