import { createMockServer } from '../../test/helpers/mock-server'
import { executeRequest } from './index'

describe('executeRequest', () => {
  it('executes a GET request', async () => {
    const server = await createMockServer()

    try {
      const result = await executeRequest({
        method: 'GET',
        url: `${server.url}/ping`
      })

      expect(result.status).toBe(200)
      expect(result.data).toEqual({ ok: true })
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
    } finally {
      await server.close()
    }
  })

  it('executes a POST request with JSON body', async () => {
    const server = await createMockServer()

    try {
      const payload = { name: 'Lunar' }
      const result = await executeRequest({
        method: 'POST',
        url: `${server.url}/echo`,
        body: payload
      })

      expect(result.status).toBe(200)
      expect(result.data).toEqual(payload)
    } finally {
      await server.close()
    }
  })

  it('falls back to text for non-JSON responses', async () => {
    const server = await createMockServer()

    try {
      const result = await executeRequest({
        method: 'GET',
        url: `${server.url}/text`
      })

      expect(result.status).toBe(200)
      expect(result.data).toBe('plain response')
    } finally {
      await server.close()
    }
  })
})
