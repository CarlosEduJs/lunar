import { EnvManager } from './index'

describe('EnvManager', () => {
  it('resolves single variable', () => {
    const env = new EnvManager({ apiKey: 'secret' })

    expect(env.resolve('Bearer {{apiKey}}')).toBe('Bearer secret')
  })

  it('resolves multiple variables', () => {
    const env = new EnvManager({ id: '42', token: 'abc' })

    expect(env.resolve('/users/{{id}}?token={{token}}')).toBe('/users/42?token=abc')
  })

  it('throws when variable does not exist', () => {
    const env = new EnvManager({})

    expect(() => env.resolve('Hello {{missing}}')).toThrow('Variable not found: missing')
  })

  it('resolves nested objects and arrays', () => {
    const env = new EnvManager({ name: 'Ada', id: '7' })
    const result = env.resolveObject({
      user: '{{name}}',
      list: ['{{id}}', { nested: '{{name}}' }]
    })

    expect(result).toEqual({ user: 'Ada', list: ['7', { nested: 'Ada' }] })
  })

  it('returns a copy of environment', () => {
    const env = new EnvManager({ a: '1' })
    const snapshot = env.getEnv()
    snapshot.a = '2'

    expect(env.getEnv().a).toBe('1')
  })
})
