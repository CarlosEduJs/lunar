import fc from 'fast-check'

import { normalizeEndpoints } from './index'
import { openApiSpecArbitrary } from '../../test/arbitraries'
import type { PathItemObject } from '../types'

// feats: Endpoint ID Uniqueness, Endpoint Structure Completeness, Complete Endpoint Normalization
describe('normalizeEndpoints properties', () => {
  it('returns one endpoint per defined operation', () => {
    fc.assert(
      fc.property(openApiSpecArbitrary(), (spec) => {
        const endpoints = normalizeEndpoints(spec)
        const expectedCount = Object.values(spec.paths).reduce((count, item) => {
          const pathItem = item as PathItemObject
          return (
            count +
            (pathItem.get ? 1 : 0) +
            (pathItem.post ? 1 : 0) +
            (pathItem.put ? 1 : 0) +
            (pathItem.patch ? 1 : 0) +
            (pathItem.delete ? 1 : 0) +
            (pathItem.head ? 1 : 0) +
            (pathItem.options ? 1 : 0)
          )
        }, 0)

        expect(endpoints).toHaveLength(expectedCount)
      }),
      { numRuns: 100 }
    )
  })

  it('produces unique endpoint ids', () => {
    fc.assert(
      fc.property(openApiSpecArbitrary(), (spec) => {
        const endpoints = normalizeEndpoints(spec)
        const ids = endpoints.map((endpoint) => endpoint.id)
        const unique = new Set(ids)
        expect(unique.size).toBe(ids.length)
      }),
      { numRuns: 100 }
    )
  })

  it('includes required endpoint fields', () => {
    fc.assert(
      fc.property(openApiSpecArbitrary(), (spec) => {
        const endpoints = normalizeEndpoints(spec)
        for (const endpoint of endpoints) {
          expect(endpoint.id).toContain(endpoint.method)
          expect(endpoint.path.startsWith('/')).toBe(true)
          expect(endpoint.parameters).toBeDefined()
          expect(Array.isArray(endpoint.parameters.path)).toBe(true)
          expect(Array.isArray(endpoint.parameters.query)).toBe(true)
          expect(Array.isArray(endpoint.parameters.header)).toBe(true)
          expect(endpoint.responses).toBeDefined()
        }
      }),
      { numRuns: 100 }
    )
  })
})
