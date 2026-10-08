import { getLineEnding, withLineEnding } from "../convert/line-endings"

/** Preserve source until the normalized document actually changes. */
export class MarkdownChangeTracker {
  private previous: string | undefined
  private initial: string
  private lineEnding: ReturnType<typeof getLineEnding>

  constructor(private source: string, initial: string, emitInitial = false) {
    this.lineEnding = getLineEnding(source)
    this.initial = withLineEnding(initial, this.lineEnding)
    this.previous = emitInitial ? undefined : this.initial
  }

  current(markdown: string): string {
    const normalized = withLineEnding(markdown, this.lineEnding)
    return normalized === this.initial ? this.source : normalized
  }

  next(markdown: string): string | undefined {
    const normalized = withLineEnding(markdown, this.lineEnding)
    if (normalized === this.previous) return undefined
    this.previous = normalized
    return this.current(normalized)
  }
}
