import { LunarError, ErrorCodes } from '../error'
import type { RequestOptions, RequestResult } from '../types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseResponseContent(contentType: string | null, rawText: string): unknown {
  if (!rawText) return null

  const hasJsonMime = contentType?.includes('application/json')

  if (hasJsonMime) {
    try {
      return JSON.parse(rawText)
    } catch {
      return rawText
    }
  }

  return rawText
}

export async function executeRequest(
  config: RequestOptions
): Promise<RequestResult> {
  const start = performance.now()
  const headers = config.headers ?? {}

  const init: RequestInit = {
    method: config.method,
    headers
  }

  if (config.body !== undefined) {
    if (typeof config.body === 'string' || config.body instanceof Uint8Array) {
      init.body = config.body
    } else if (isPlainObject(config.body) || Array.isArray(config.body)) {
      init.body = JSON.stringify(config.body)
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
      }
    } else {
      init.body = String(config.body)
    }
  }

  let response: Response

  try {
    response = await fetch(config.url, init)
  } catch (error) {
    throw new LunarError(
      error instanceof Error ? error.message : 'Network request failed',
      ErrorCodes.NETWORK_ERROR
    )
  }

  const rawText = await response.text()
  const contentType = response.headers.get('content-type')
  const data = parseResponseContent(contentType, rawText)

  const executionTime = performance.now() - start
  const responseHeaders: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value
  })

  return {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    data,
    executionTime
  }
}
