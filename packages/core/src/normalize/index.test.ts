import { normalizeEndpoints } from './index'
import type { DereferencedSpec } from '../types'

const baseSpec: DereferencedSpec = {
  openapi: '3.0.0',
  info: { title: 'Test', version: '1.0.0' },
  paths: {
    '/users': {
      get: {
        summary: 'List users',
        responses: {
          '200': { description: 'ok' }
        }
      },
      post: {
        responses: {
          '201': { description: 'created' }
        }
      }
    }
  }
}

describe('normalizeEndpoints', () => {
  it('normalizes a simple spec', () => {
    const endpoints = normalizeEndpoints(baseSpec)

    expect(endpoints).toHaveLength(2)
    const first = endpoints[0]
    expect(first).toBeDefined()
    if (!first) return
    expect(first.id).toBe('GET /users')
    expect(first.summary).toBe('List users')
  })

  it('includes endpoints without summary', () => {
    const endpoints = normalizeEndpoints(baseSpec)
    const post = endpoints.find((item) => item.id === 'POST /users')

    expect(post).toBeDefined()
    if (!post) return
    expect(post.summary).toBeUndefined()
  })

  it('groups path, query, and header parameters', () => {
    const spec: DereferencedSpec = {
      ...baseSpec,
      paths: {
        '/items/{id}': {
          get: {
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' }
              },
              {
                name: 'filter',
                in: 'query',
                required: false,
                schema: { type: 'string' }
              },
              {
                name: 'x-trace',
                in: 'header',
                required: false,
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': { description: 'ok' }
            }
          }
        }
      }
    }

    const endpoints = normalizeEndpoints(spec)
    const endpoint = endpoints[0]

    expect(endpoint).toBeDefined()
    if (!endpoint) return
    expect(endpoint.parameters.path).toHaveLength(1)
    expect(endpoint.parameters.query).toHaveLength(1)
    expect(endpoint.parameters.header).toHaveLength(1)
  })
})
