import http from 'node:http'

export type MockServer = {
  url: string
  close: () => Promise<void>
}

export async function createMockServer(): Promise<MockServer> {
  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res.statusCode = 400
      res.end('Missing URL')
      return
    }

    if (req.url.startsWith('/ping')) {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: true }))
      return
    }

    if (req.url.startsWith('/text')) {
      res.setHeader('Content-Type', 'text/plain')
      res.end('plain response')
      return
    }

    if (req.url.startsWith('/echo') && req.method === 'POST') {
      const chunks: Buffer[] = []
      for await (const chunk of req) {
        chunks.push(Buffer.from(chunk))
      }
      const body = Buffer.concat(chunks).toString('utf8')
      res.setHeader('Content-Type', 'application/json')
      res.end(body)
      return
    }

    res.statusCode = 404
    res.end('Not found')
  })

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve())
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Failed to start mock server')
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      })
  }
}
