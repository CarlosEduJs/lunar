import { EnvManager } from './env'
import { normalizeEndpoints } from './normalize'
import { parseOpenAPI } from './parser'
import { executeRequest } from './request'
import { StateManager } from './state'

import { LunarError, ErrorCodes } from './error'
import type { Endpoint, Environment, HistoryEntry, RequestResult } from './types'

export type ExecuteOptions = {
  pathParams?: Record<string, string>
  queryParams?: Record<string, string>
  headers?: Record<string, string>
  body?: unknown
  baseUrl?: string
}

export type LunarConfig = {
  spec: string | object
  env?: Environment
  maxHistory?: number
}

export type ExecutionResult = {
  success: boolean
  response?: RequestResult
  error?: string
}

export type LunarEngine = {
  getEndpoints(): Endpoint[]
  getEndpoint(id: string): Endpoint | undefined
  execute(endpointId: string, options?: ExecuteOptions): Promise<ExecutionResult>
  setEnv(env: Environment): void
  getEnv(): Environment
  getHistory(): HistoryEntry[]
}

function buildPath(path: string, pathParams?: Record<string, string>): string {
  if (!pathParams) return path
  let resolvedPath = path
  for (const [key, value] of Object.entries(pathParams)) {
    resolvedPath = resolvedPath.replace(`{${key}}`, value)
  }
  return resolvedPath
}

function createHistoryEntry(
  endpointId: string,
  request: {
    method: Endpoint['method']
    url: string
    headers?: Record<string, string>
    body?: unknown
  },
  response: RequestResult
): HistoryEntry {
  const timestamp = Date.now()
  return {
    id: `${timestamp}-${Math.random().toString(36).slice(2, 11)}`,
    timestamp,
    endpointId,
    request,
    response
  }
}

export async function createLunar(config: LunarConfig): Promise<LunarEngine> {
  const parseResult = await parseOpenAPI(config.spec)
  if (!parseResult.success) {
    throw new LunarError(`Failed to parse OpenAPI spec: ${parseResult.error}`, ErrorCodes.INVALID_SPEC)
  }

  const endpoints = normalizeEndpoints(parseResult.spec)
  const envManager = new EnvManager(config.env)
  const stateManager = new StateManager({ maxHistory: config.maxHistory })
  const baseUrl = parseResult.spec.servers?.[0]?.url ?? ''

  return {
    getEndpoints: () => endpoints,
    getEndpoint: (id: string) => endpoints.find((endpoint) => endpoint.id === id),
    execute: async (endpointId: string, options?: ExecuteOptions) => {
      try {
        const endpoint = endpoints.find((item) => item.id === endpointId)
        if (!endpoint) {
          return {
            success: false,
            error: new LunarError(`Endpoint not found: ${endpointId}`, ErrorCodes.ENDPOINT_NOT_FOUND).message
          }
        }

        const path = buildPath(endpoint.path, options?.pathParams)
        const url = new URL(path, options?.baseUrl ?? baseUrl)
        if (options?.queryParams) {
          for (const [key, value] of Object.entries(options.queryParams)) {
            url.searchParams.append(key, value)
          }
        }

        const resolvedUrl = envManager.resolve(url.toString())
        const resolvedHeaders = options?.headers
          ? (envManager.resolveObject(options.headers) as Record<string, string>)
          : undefined
        const resolvedBody = options?.body
          ? envManager.resolveObject(options.body)
          : undefined

        const response = await executeRequest({
          method: endpoint.method,
          url: resolvedUrl,
          headers: resolvedHeaders,
          body: resolvedBody
        })

        const historyEntry = createHistoryEntry(
          endpointId,
          {
            method: endpoint.method,
            url: resolvedUrl,
            headers: resolvedHeaders,
            body: resolvedBody
          },
          response
        )
        stateManager.addHistoryEntry(historyEntry)

        return { success: true, response }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    },
    setEnv: (env: Environment) => envManager.setEnv(env),
    getEnv: () => envManager.getEnv(),
    getHistory: () => stateManager.getHistory()
  }
}

export type {
  Endpoint,
  Environment,
  HistoryEntry,
  HttpMethod,
  LunarInstance,
  ParseResult,
  RequestBody,
  ResponseObject,
  RequestOptions,
  RequestResult
} from './types'
