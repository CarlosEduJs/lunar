import type { HistoryEntry } from '../types'

export type StateConfig = {
  maxHistory?: number
}

const DEFAULT_MAX_HISTORY = 50

export class StateManager {
  private history: HistoryEntry[] = []
  private maxHistory: number

  constructor(config?: StateConfig) {
    this.maxHistory = config?.maxHistory ?? DEFAULT_MAX_HISTORY
  }

  addHistoryEntry(entry: HistoryEntry): void {
    this.history.push(entry)
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory)
    }
  }

  getHistory(): HistoryEntry[] {
    return [...this.history]
  }

  clearHistory(): void {
    this.history = []
  }
}
