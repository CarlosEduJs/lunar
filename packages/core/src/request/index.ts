import type { RequestConfig, RequestResult } from '../types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function executeRequest(
  config: RequestConfig
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

  const response = await fetch(config.url, init)
  const rawText = await response.text()
  let data: unknown = rawText

  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      data = rawText
    }
  } else {
    data = null
  }

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
