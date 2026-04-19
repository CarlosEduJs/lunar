import type {
  DereferencedSpec,
  Endpoint,
  HttpMethod,
  Parameter,
  ParameterObject,
  RequestBody,
  RequestBodyObject,
  ResponseObject
} from '../types'

const METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS'
]

function mapParameter(parameter: ParameterObject): Parameter {
  return {
    name: parameter.name,
    required: parameter.required ?? false,
    schema: parameter.schema ?? {},
    description: parameter.description
  }
}

function mapRequestBody(requestBody?: RequestBodyObject): RequestBody | undefined {
  if (!requestBody) return undefined
  return {
    required: requestBody.required ?? false,
    content: requestBody.content
  }
}

function groupParameters(parameters: ParameterObject[]): {
  path: Parameter[]
  query: Parameter[]
  header: Parameter[]
} {
  const grouped = {
    path: [] as Parameter[],
    query: [] as Parameter[],
    header: [] as Parameter[]
  }

  for (const parameter of parameters) {
    if (parameter.in === 'path') {
      grouped.path.push(mapParameter(parameter))
    } else if (parameter.in === 'query') {
      grouped.query.push(mapParameter(parameter))
    } else if (parameter.in === 'header') {
      grouped.header.push(mapParameter(parameter))
    }
  }

  return grouped
}

export function normalizeEndpoints(spec: DereferencedSpec): Endpoint[] {
  const endpoints: Endpoint[] = []

  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const method of METHODS) {
      const operation = pathItem[method.toLowerCase() as keyof typeof pathItem]
      if (!operation) continue

      const allParameters = [
        ...(pathItem.parameters ?? []),
        ...(operation.parameters ?? [])
      ]

      const parameters = groupParameters(allParameters)

      const endpoint: Endpoint = {
        id: `${method} ${path}`,
        method,
        path,
        summary: operation.summary,
        parameters,
        requestBody: mapRequestBody(operation.requestBody),
        responses: operation.responses as Record<string, ResponseObject>
      }

      endpoints.push(endpoint)
    }
  }

  return endpoints
}
