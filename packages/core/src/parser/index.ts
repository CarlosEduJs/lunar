import { dereference, validate } from '@scalar/openapi-parser'

import { LunarError, ErrorCodes } from '../error'
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
        error: new LunarError(message, ErrorCodes.INVALID_SPEC).message
      }
    }

    const result = await dereference(spec, { throwOnError: true })
    if (!result.specification) {
      return {
        success: false,
        error: new LunarError('OpenAPI parser returned empty specification', ErrorCodes.INVALID_SPEC).message
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
