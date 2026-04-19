import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { parseOpenAPI } from './index'

const fixturesDir = join(__dirname, '../../test/fixtures')

describe('parseOpenAPI', () => {
  it('parses valid JSON OpenAPI', async () => {
    const jsonSpec = await readFile(join(fixturesDir, 'openapi-3-0.json'), 'utf8')
    const result = await parseOpenAPI(jsonSpec)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.spec.openapi).toBe('3.0.0')
      expect(result.spec.paths).toBeDefined()
    }
  })

  it('parses valid YAML OpenAPI', async () => {
    const yamlSpec = await readFile(join(fixturesDir, 'openapi-3-1.yaml'), 'utf8')
    const result = await parseOpenAPI(yamlSpec)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.spec.openapi).toBe('3.1.0')
      expect(result.spec.paths).toBeDefined()
    }
  })

  it('returns error for invalid OpenAPI', async () => {
    const invalidSpec = await readFile(
      join(fixturesDir, 'openapi-invalid.json'),
      'utf8'
    )
    const result = await parseOpenAPI(invalidSpec)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })
})
