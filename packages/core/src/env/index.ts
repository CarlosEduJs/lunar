import type { Environment } from '../types'

export class EnvManager {
  private env: Environment = {}

  constructor(initialEnv?: Environment) {
    if (initialEnv) {
      this.env = { ...initialEnv }
    }
  }

  setEnv(env: Environment): void {
    this.env = { ...env }
  }

  getEnv(): Environment {
    return { ...this.env }
  }

  resolve(template: string): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_match, varName: string) => {
      const value = this.env[varName]
      if (value === undefined) {
        throw new Error(`Variable not found: ${varName}`)
      }
      return value
    })
  }

  resolveObject(obj: unknown): unknown {
    if (typeof obj === 'string') {
      return this.resolve(obj)
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.resolveObject(item))
    }

    if (obj && typeof obj === 'object') {
      const resolved: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveObject(value)
      }
      return resolved
    }

    return obj
  }
}
