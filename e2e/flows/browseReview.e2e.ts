// Run with: npx detox test -c android.emu.debug
import { by, device, element, expect } from "detox";

describe("Browse & Review", () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: {
        detoxEnableSynchronization: 1,
      },
    });
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  xit("shows diary entries", async () => {
    await expect(element(by.id("search-toggle-btn"))).toBeVisible();
  });

  xit("searches diary entries", async () => {
    await element(by.id("search-toggle-btn")).tap();
    await element(by.id("search-input")).typeText("coffee");
    await expect(element(by.id("diary-entry-card-entry-1"))).toBeVisible();
  });

  xit("opens contextual delete flow and cancels", async () => {
    await element(by.id("diary-entry-card-entry-1")).longPress();
    await expect(element(by.label("Delete entry"))).toBeVisible();
    await element(by.label("Delete entry")).tap();
    await expect(element(by.label("Cancel delete"))).toBeVisible();
    await element(by.label("Cancel delete")).tap();
  });

  xit("toggles task completion", async () => {
    await expect(element(by.label("Toggle task task-1"))).toBeVisible();
    await element(by.label("Toggle task task-1")).tap();
  });
});
