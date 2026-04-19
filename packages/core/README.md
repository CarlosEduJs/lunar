# @lunar/core

Headless OpenAPI engine for the Lunar project.

## Overview

`@lunar/core` is a TypeScript library that provides essential functionality for working with OpenAPI 3.0 and 3.1 specifications. It handles parsing, normalization, and execution of HTTP requests based on OpenAPI specs, while maintaining environment state and request history.

## Features

- Parse OpenAPI 3.0 and 3.1 specifications (JSON/YAML)
- Normalize API endpoints into a flat, predictable structure
- Execute HTTP requests with parameter support
- Variable templating with `{{var}}` syntax
- Environment management
- Request history tracking
- Fully headless (no UI dependencies)

## Installation

```bash
pnpm add @lunar/core
```

## Usage

```typescript
import { createLunar } from '@lunar/core'

const lunar = await createLunar({
  spec: './openapi.json',
  env: {
    apiKey: 'your-api-key'
  }
})

const endpoints = lunar.getEndpoints()

const result = await lunar.execute('GET /users/{id}', {
  pathParams: { id: '123' },
  headers: { Authorization: 'Bearer {{apiKey}}' }
})

if (result.success) {
  console.log(result.response.status)
  console.log(result.response.data)
} else {
  console.error(result.error)
}
```

## API

```typescript
type LunarConfig = {
  spec: string | object
  env?: Record<string, string>
  maxHistory?: number  // default: 50
}

type LunarInstance = {
  getEndpoints(): Endpoint[]
  getEndpoint(id: string): Endpoint | undefined
  execute(endpointId: string, options?: ExecuteOptions): Promise<ExecutionResult>
  setEnv(env: Environment): void
  getEnv(): Environment
  getHistory(): HistoryEntry[]
}

type ExecuteOptions = {
  pathParams?: Record<string, string>
  queryParams?: Record<string, string>
  headers?: Record<string, string>
  body?: unknown
  baseUrl?: string
}

type ExecutionResult =
  | { success: true; response: RequestResult }
  | { success: false; error: string }
```

- `createLunar(config)` parses the spec, normalizes endpoints, and returns a headless engine.
- `getEndpoints()` returns all normalized endpoints.
- `getEndpoint(id)` returns a single endpoint or `undefined`.
- `execute(endpointId, options)` runs an HTTP request and stores history.
- `setEnv(env)` replaces the current environment.
- `getEnv()` returns a copy of the current environment.
- `getHistory()` returns the execution history.

## Development

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Architecture

The library is organized into modular components:

- `parser/` - OpenAPI parsing and dereferencing
- `normalize/` - Endpoint normalization
- `request/` - HTTP request execution
- `env/` - Environment and variable management
- `state/` - Request history tracking
- `types/` - Shared TypeScript definitions

## License

MIT
