import assert from "node:assert/strict"
import { it } from "node:test"
import { isBetterHotkey } from "./is-better-hotkey"
import { isMac } from "../core-utils/is-mac"

it("detects the current browser after SSR and expands mod for both platforms", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window")
  try {
    Reflect.deleteProperty(globalThis, "window")
    assert.equal(isMac(), false)
    for (const mac of [true, false]) {
      Object.defineProperty(globalThis, "window", {
        value: { navigator: { platform: mac ? "MacIntel" : "Win32", userAgent: mac ? "Macintosh" : "Windows" } },
        configurable: true,
      })
      const match = isBetterHotkey("mod+b")
      const event = { which: 66, key: "b", altKey: false, shiftKey: false, metaKey: mac, ctrlKey: !mac }
      assert.equal(match(event as KeyboardEvent), true)
      assert.equal(match({ ...event, metaKey: !mac, ctrlKey: mac } as KeyboardEvent), false)
    }
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous)
    else Reflect.deleteProperty(globalThis, "window")
  }
})
