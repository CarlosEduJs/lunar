import fc from 'fast-check'

export const identifierArbitrary = () =>
  fc.stringMatching(/^[A-Za-z_][A-Za-z0-9_]{0,11}$/)

export const schemaArbitrary = () =>
  fc.record({
    type: fc.constantFrom('string', 'number', 'boolean', 'integer', 'object'),
    description: fc.option(fc.string({ minLength: 1 }), { nil: undefined })
  })

export const parameterArbitrary = () =>
  fc.record({
    name: identifierArbitrary(),
    in: fc.constantFrom('path', 'query', 'header'),
    required: fc.boolean(),
    schema: schemaArbitrary(),
    description: fc.option(fc.string(), { nil: undefined })
  })

export const responseObjectArbitrary = () =>
  fc.record({
    description: fc.string({ minLength: 1 })
  })

export const responsesArbitrary = () =>
  fc.dictionary(
    fc.constantFrom('200', '201', '400', '404', '500'),
    responseObjectArbitrary(),
    { minKeys: 1, maxKeys: 3 }
  )

export const requestBodyArbitrary = () =>
  fc.record({
    required: fc.boolean(),
    content: fc.record({
      'application/json': fc.record({
        schema: schemaArbitrary()
      })
    })
  })

export const operationArbitrary = () =>
  fc.record({
    summary: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
    parameters: fc.option(fc.array(parameterArbitrary(), { maxLength: 3 }), {
      nil: undefined
    }),
    requestBody: fc.option(requestBodyArbitrary(), { nil: undefined }),
    responses: responsesArbitrary().map((responses) => ({
      ...responses,
      '200': responses['200'] ?? { description: 'ok' }
    }))
  })

export const pathItemArbitrary = () =>
  fc
    .tuple(
      fc.option(operationArbitrary(), { nil: undefined }),
      fc.option(operationArbitrary(), { nil: undefined })
    )
    .filter(([get, post]) => Boolean(get) || Boolean(post))
    .map(([get, post]) => ({
      parameters: undefined,
      get: get ?? undefined,
      post: post ?? undefined
    }))

export const openApiSpecArbitrary = () =>
  fc.constant({
    openapi: '3.0.0',
    info: {
      title: 'Property API',
      version: '1.0.0'
    },
    paths: {
      '/users': {
        get: {
          responses: {
            '200': { description: 'ok' }
          }
        },
        post: {
          responses: {
            '201': { description: 'created' }
          }
        }
      }
    }
  })

export const openApi31TypeArraySpecArbitrary = () =>
  fc.record({
    openapi: fc.constant('3.1.0'),
    info: fc.record({
      title: fc.string({ minLength: 1 }),
      version: fc.string({ minLength: 1 })
    }),
    paths: fc.dictionary(
      fc
        .string({ minLength: 2 })
        .filter((value) => value.startsWith('/')),
      fc.record({
        get: fc.record({
          responses: fc.record({
            '200': fc.record({
              description: fc.string({ minLength: 1 }),
              content: fc.record({
                'application/json': fc.record({
                  schema: fc.record({
                    type: fc.constantFrom(['string', 'null'], ['integer', 'null'])
                  })
                })
              })
            })
          })
        })
      }),
      { minKeys: 1, maxKeys: 3 }
    )
  })

export const environmentArbitrary = () =>
  fc.dictionary(identifierArbitrary(), fc.string(), { maxKeys: 6 })

export const templateStringArbitrary = (env: Record<string, string>) => {
  const keys = Object.keys(env)
  if (keys.length === 0) {
    return fc.string()
  }

  return fc
    .array(
      fc.oneof(
        fc.string(),
        fc.constantFrom(...keys).map((key) => `{{${key}}}`)
      ),
      { minLength: 1, maxLength: 6 }
    )
    .map((parts) => parts.join(''))
}

export const historyEntryArbitrary = () =>
  fc.record({
    id: identifierArbitrary(),
    timestamp: fc.integer({ min: 1, max: Number.MAX_SAFE_INTEGER }),
    endpointId: fc.string({ minLength: 1 }),
    request: fc.record({
      method: fc.constantFrom('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'),
      url: fc.webUrl(),
      headers: fc.option(fc.dictionary(identifierArbitrary(), fc.string()), {
        nil: undefined
      }),
      body: fc.option(fc.string(), { nil: undefined })
    }),
    response: fc.record({
      status: fc.integer({ min: 100, max: 599 }),
      statusText: fc.string({ minLength: 1 }),
      headers: fc.dictionary(identifierArbitrary(), fc.string()),
      data: fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.object()),
      executionTime: fc.integer({ min: 0, max: 10000 })
    })
  })
  .map((entry) => entry as unknown as import('../src/types').HistoryEntry)
