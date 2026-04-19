import { dereference, validate } from '@scalar/openapi-parser'

import type { DereferencedSpec, ParseResult } from '../types'

export async function parseOpenAPI(
  spec: string | object
): Promise<ParseResult> {
  try {
    const validation = await validate(spec, { throwOnError: false })
    if (!validation.valid) {
      const message = validation.errors?.[0]?.message ?? 'Invalid OpenAPI spec'
      return {
        success: false,
        error: message
      }
    }

    const result = await dereference(spec, { throwOnError: true })
    if (!result.specification) {
      return {
        success: false,
        error: 'OpenAPI parser returned empty specification'
      }
    }

    return {
      success: true,
      spec: result.specification as DereferencedSpec
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
