import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { createLunar } from './index'
import { createMockServer } from '../test/helpers/mock-server'

const fixturesDir = join(__dirname, '../test/fixtures')

describe('createLunar', () => {
  it('creates an engine from valid spec', async () => {
    const jsonSpec = await readFile(join(fixturesDir, 'openapi-3-0.json'), 'utf8')
    const lunar = await createLunar({ spec: jsonSpec })

    const endpoints = lunar.getEndpoints()
    expect(endpoints.length).toBeGreaterThan(0)
    expect(lunar.getEndpoint(endpoints[0].id)).toBeDefined()
  })

  it('throws on invalid spec', async () => {
    const invalidSpec = await readFile(
      join(fixturesDir, 'openapi-invalid.json'),
      'utf8'
    )

    await expect(createLunar({ spec: invalidSpec })).rejects.toThrow(
      'Failed to parse OpenAPI spec'
    )
  })

  it('executes requests and stores history', async () => {
    const server = await createMockServer()

    const spec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
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
      const lunar = await createLunar({ spec })
      const result = await lunar.execute('GET /ping')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.response?.status).toBe(200)
      }

      const history = lunar.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].endpointId).toBe('GET /ping')
    } finally {
      await server.close()
    }
  })
})
