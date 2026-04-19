import fc from 'fast-check'

import { executeRequest } from './index'
import { createMockServer } from '../../test/helpers/mock-server'

// feat: response Structure Completeness
describe('executeRequest properties', () => {
  it('returns full response shape', async () => {
    const server = await createMockServer()

    try {
      await fc.assert(
        fc.asyncProperty(fc.constant(`${server.url}/ping`), async (url) => {
          const result = await executeRequest({ method: 'GET', url })

          expect(typeof result.status).toBe('number')
          expect(typeof result.statusText).toBe('string')
          expect(result.headers).toBeDefined()
          expect(result).toHaveProperty('data')
          expect(result.executionTime).toBeGreaterThanOrEqual(0)
        }),
        { numRuns: 20 }
      )
    } finally {
      await server.close()
    }
  })
})
