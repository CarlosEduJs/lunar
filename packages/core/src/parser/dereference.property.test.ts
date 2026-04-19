import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { parseOpenAPI } from './index'

const fixturesDir = join(__dirname, '../../test/fixtures')

// feat: Reference Dereferencing
describe('parseOpenAPI dereference property', () => {
  it('retains reference targets in components after parse', async () => {
    const spec = await readFile(join(fixturesDir, 'openapi-ref.json'), 'utf8')

    const result = await parseOpenAPI(spec)
    expect(result.success).toBe(true)
    if (!result.success) return

    const component = (result.spec.components?.parameters as Record<string, unknown> | undefined)?.UserId
    expect(component).toBeDefined()
    expect(component).toHaveProperty('name', 'id')
  })
})
