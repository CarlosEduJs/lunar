import fc from 'fast-check'

import { createLunar } from './index'
import { createMockServer } from '../test/helpers/mock-server'
import { openApiSpecArbitrary, openApi31TypeArraySpecArbitrary } from '../test/arbitraries'

describe('createLunar properties', () => {
  it('returns endpoints by id when present', async () => {
    await fc.assert(
      fc.asyncProperty(openApiSpecArbitrary(), async (spec) => {
        const lunar = await createLunar({ spec })
        const endpoints = lunar.getEndpoints()
        if (endpoints.length === 0) return

        const target = endpoints[0]
        if (!target) return

        const found = lunar.getEndpoint(target.id)
        expect(found?.id).toBe(target.id)
      }),
      { numRuns: 50 }
    )
  })

  it('uses updated environment values for execution', async () => {
    const server = await createMockServer()

    const spec = {
      openapi: '3.0.0',
      info: { title: 'Env', version: '1.0.0' },
      servers: [{ url: server.url }],
      paths: {
        '/ping': {
          get: {
            responses: {
              '200': { description: 'ok' }
            }
          }
        }
      }
    }

    try {
      const lunar = await createLunar({ spec, env: { token: 'one' } })
      lunar.setEnv({ token: 'two' })

      const result = await lunar.execute('GET /ping', {
        headers: { Authorization: 'Bearer {{token}}' }
      })

      expect(result.success).toBe(true)
      if (!result.success) return

      const history = lunar.getHistory()
      const entry = history[0]
      expect(entry?.request.headers?.Authorization).toBe('Bearer two')
    } finally {
      await server.close()
    }
  })

  it('supports OpenAPI 3.1 type arrays', async () => {
    await fc.assert(
      fc.asyncProperty(openApi31TypeArraySpecArbitrary(), async (spec) => {
        const lunar = await createLunar({ spec })
        const endpoints = lunar.getEndpoints()
        expect(endpoints.length).toBeGreaterThan(0)
      }),
      { numRuns: 50 }
    )
  })
})
