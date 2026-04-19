export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'

export type InfoObject = {
  title: string
  version: string
  description?: string
}

export type ServerObject = {
  url: string
  description?: string
}

export type PathsObject = Record<string, PathItemObject>

export type PathItemObject = {
  parameters?: ParameterObject[]
  get?: OperationObject
  post?: OperationObject
  put?: OperationObject
  patch?: OperationObject
  delete?: OperationObject
  head?: OperationObject
  options?: OperationObject
}

export type OperationObject = {
  summary?: string
  description?: string
  operationId?: string
  parameters?: ParameterObject[]
  requestBody?: RequestBodyObject
  responses: ResponsesObject
}

export type ParameterObject = {
  name: string
  in: 'path' | 'query' | 'header' | 'cookie'
  required?: boolean
  schema?: SchemaObject
  description?: string
}

export type RequestBodyObject = {
  required?: boolean
  content: Record<string, MediaTypeObject>
}

export type MediaTypeObject = {
  schema?: SchemaObject
}

export type ResponsesObject = Record<string, ResponseObject>

export type ResponseObject = {
  description: string
  content?: Record<string, MediaTypeObject>
}

export type SchemaObject = {
  type?: string | string[]
  format?: string
  properties?: Record<string, SchemaObject>
  items?: SchemaObject
  required?: string[]
  enum?: unknown[]
  default?: unknown
  description?: string
  nullable?: boolean
}

export type DereferencedSpec = {
  openapi: string
  info: InfoObject
  servers?: ServerObject[]
  paths: PathsObject
  components?: Record<string, unknown>
}

export type ParseResult =
  | { success: true; spec: DereferencedSpec }
  | { success: false; error: string }

export type Parameter = {
  name: string
  required: boolean
  schema: SchemaObject
  description?: string
}

export type RequestBody = {
  required: boolean
  content: Record<string, MediaTypeObject>
}

export type Endpoint = {
  id: string
  method: HttpMethod
  path: string
  summary?: string
  parameters: {
    path: Parameter[]
    query: Parameter[]
    header: Parameter[]
  }
  requestBody?: RequestBody
  responses: Record<string, ResponseObject>
}

export type RequestOptions = {
  method: HttpMethod
  url: string
  headers?: Record<string, string>
  body?: unknown
}

export type RequestResult = {
  status: number
  statusText: string
  headers: Record<string, string>
  data: unknown
  executionTime: number
}

export type Environment = Record<string, string>

export type HistoryEntry = {
  id: string
  timestamp: number
  endpointId: string
  request: {
    method: HttpMethod
    url: string
    headers?: Record<string, string>
    body?: unknown
  }
  response: RequestResult
}

export type LunarInstance = {
  getEndpoints(): Endpoint[]
  getEndpoint(id: string): Endpoint | undefined
  execute(endpointId: string, options?: {
    pathParams?: Record<string, string>
    queryParams?: Record<string, string>
    headers?: Record<string, string>
    body?: unknown
    baseUrl?: string
  }): Promise<{
    success: boolean
    response?: RequestResult
    error?: string
  }>
  setEnv(env: Environment): void
  getEnv(): Environment
  getHistory(): HistoryEntry[]
}
