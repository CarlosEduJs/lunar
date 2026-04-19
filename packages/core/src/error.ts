export class LunarError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'LunarError'
    this.code = code
  }
}

export const ErrorCodes = {
  INVALID_SPEC: 'INVALID_SPEC',
  ENDPOINT_NOT_FOUND: 'ENDPOINT_NOT_FOUND',
  REQUEST_FAILED: 'REQUEST_FAILED',
  VARIABLE_NOT_FOUND: 'VARIABLE_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const