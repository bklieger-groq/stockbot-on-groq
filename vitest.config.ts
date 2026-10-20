import { defineConfig } from 'vitest/config'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'

const require = createRequire(import.meta.url)

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname) },
      // streamUI is a server API; use the SDK's real server implementation.
      {
        find: 'ai/rsc',
        replacement: resolve(
          dirname(require.resolve('ai/package.json')),
          'rsc/dist/rsc-server.mjs'
        )
      },
      {
        find: 'server-only',
        replacement: resolve(__dirname, 'tests/server-only.ts')
      }
    ]
  },
  esbuild: { jsx: 'automatic' },
  test: {
    include: ['tests/**/*.test.tsx'],
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } }
  }
})
