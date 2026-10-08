const IS_MAC_REGEX = /mac os x|macintosh/i

/** Evaluate in the current browser; SSR must not cache a non-Mac result. */
export function isMac() {
  if (typeof window === "undefined") return false
  const { platform, userAgent } = window.navigator
  return /Mac|iPod|iPhone|iPad/.test(platform || "") || IS_MAC_REGEX.test(userAgent || "")
}
