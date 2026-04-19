import fc from 'fast-check'

import { EnvManager } from './index'
import {
  environmentArbitrary,
  identifierArbitrary,
  templateStringArbitrary
} from '../../test/arbitraries'

// feats: Environment Round-Trip, Undefined Variable Error and Variable Template Resolution
describe('EnvManager properties', () => {
  it('resolves template strings with environment values', () => {
    fc.assert(
      fc.property(
        environmentArbitrary().chain((env) =>
          templateStringArbitrary(env).map((template) => ({ env, template }))
        ),
        ({ env, template }) => {
          const manager = new EnvManager(env)
          const resolved = manager.resolve(template)
          for (const [key, value] of Object.entries(env)) {
            expect(resolved.includes(`{{${key}}}`)).toBe(false)
            if (template.includes(`{{${key}}}`)) {
              expect(resolved.includes(value)).toBe(true)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('throws when template references undefined variable', () => {
    fc.assert(
      fc.property(environmentArbitrary(), identifierArbitrary(), (env, name) => {
        if (name in env) return
        const manager = new EnvManager(env)
        expect(() => manager.resolve(`{{${name}}}`)).toThrow(
          `Variable not found: ${name}`
        )
      }),
      { numRuns: 100 }
    )
  })

  it('round-trips environment via setEnv/getEnv', () => {
    fc.assert(
      fc.property(environmentArbitrary(), (env) => {
        const manager = new EnvManager()
        manager.setEnv(env)
        expect(manager.getEnv()).toEqual(env)
      }),
      { numRuns: 100 }
    )
  })
})
