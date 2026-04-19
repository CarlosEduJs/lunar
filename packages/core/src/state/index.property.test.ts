import fc from 'fast-check'

import { StateManager } from './index'
import { historyEntryArbitrary } from '../../test/arbitraries'

// feats: History Growth and History Entry Structure
describe('StateManager properties', () => {
  it('grows history with each entry', () => {
    fc.assert(
      fc.property(fc.array(historyEntryArbitrary(), { minLength: 1, maxLength: 10 }), (entries) => {
        const state = new StateManager()
        entries.forEach((entry) => state.addHistoryEntry(entry))

        const history = state.getHistory()
        expect(history).toHaveLength(entries.length)
        expect(history[history.length - 1]).toEqual(entries[entries.length - 1])
      }),
      { numRuns: 100 }
    )
  })

  it('preserves entry structure', () => {
    fc.assert(
      fc.property(historyEntryArbitrary(), (entry) => {
        const state = new StateManager()
        state.addHistoryEntry(entry)

        const history = state.getHistory()
        const stored = history[0]

        expect(stored?.id).toBe(entry.id)
        expect(stored?.timestamp).toBe(entry.timestamp)
        expect(stored?.endpointId).toBe(entry.endpointId)
        expect(stored?.request.method).toBe(entry.request.method)
        expect(stored?.response.status).toBe(entry.response.status)
      }),
      { numRuns: 100 }
    )
  })
})
