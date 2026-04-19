import { StateManager } from './index'

describe('StateManager', () => {
  it('starts with empty history', () => {
    const state = new StateManager()

    expect(state.getHistory()).toEqual([])
  })

  it('adds history entries', () => {
    const state = new StateManager()
    const entry = {
      id: '1',
      timestamp: 1,
      endpointId: 'GET /ping',
      request: { method: 'GET', url: 'http://localhost' },
      response: {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: { ok: true },
        executionTime: 5
      }
    } as const

    state.addHistoryEntry(entry)

    expect(state.getHistory()).toEqual([entry])
  })

  it('clears history', () => {
    const state = new StateManager()
    state.addHistoryEntry({
      id: '1',
      timestamp: 1,
      endpointId: 'GET /ping',
      request: { method: 'GET', url: 'http://localhost' },
      response: {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: { ok: true },
        executionTime: 5
      }
    } as const)

    state.clearHistory()

    expect(state.getHistory()).toEqual([])
  })

  it('returns a copy of history', () => {
    const state = new StateManager()
    state.addHistoryEntry({
      id: '1',
      timestamp: 1,
      endpointId: 'GET /ping',
      request: { method: 'GET', url: 'http://localhost' },
      response: {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: { ok: true },
        executionTime: 5
      }
    } as const)

    const history = state.getHistory()
    history.push({
      id: '2',
      timestamp: 2,
      endpointId: 'GET /pong',
      request: { method: 'GET', url: 'http://localhost' },
      response: {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: { ok: true },
        executionTime: 5
      }
    } as const)

    expect(state.getHistory()).toHaveLength(1)
  })
})
