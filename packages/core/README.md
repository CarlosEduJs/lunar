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

// the init with OpenAPI spec
const lunar = await createLunar({
  spec: './openapi.json',
  env: {
    baseUrl: 'https://api.example.com',
    apiKey: 'your-api-key'
  }
})

// list available endpoints
const endpoints = lunar.getEndpoints()

// execute a request
const result = await lunar.execute('GET /users/{id}', {
  pathParams: { id: '123' },
  headers: { 'Authorization': 'Bearer {{apiKey}}' }
})
```

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
