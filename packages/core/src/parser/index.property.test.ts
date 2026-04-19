import fc from 'fast-check'

import { parseOpenAPI } from './index'
import { openApiSpecArbitrary } from '../../test/arbitraries'

// feat: OpenAPI Parsing Round-Trip
describe('parseOpenAPI properties', () => {
  it('parses to a structured object for valid specs', async () => {
    await fc.assert(
      fc.asyncProperty(openApiSpecArbitrary(), async (spec) => {
        const result = await parseOpenAPI(spec)
        expect(result.success).toBe(true)
        if (!result.success) return

        expect(result.spec.openapi).toBeDefined()
        expect(result.spec.info).toBeDefined()
        expect(result.spec.paths).toBeDefined()
      }),
      { numRuns: 50 }
    )
  })
})
