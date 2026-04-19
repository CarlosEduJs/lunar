import type { HistoryEntry } from '../types'

export class StateManager {
  private history: HistoryEntry[] = []

  addHistoryEntry(entry: HistoryEntry): void {
    this.history.push(entry)
  }

  getHistory(): HistoryEntry[] {
    return [...this.history]
  }

  clearHistory(): void {
    this.history = []
  }
}
