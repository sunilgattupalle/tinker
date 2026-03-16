import { fileURLToPath, URL } from 'node:url'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { marked } from 'marked'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

const DOCS_PREFIX = '/tinker/docs'
const ROOT = process.cwd()

const DOCS_CSS = `
  body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; line-height: 1.6; max-width: 52rem; margin: 0 auto; padding: 2rem; color: #1a1a1a; }
  h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; }
  h1 { font-size: 1.75rem; border-bottom: 1px solid #e2e0dc; padding-bottom: 0.25em; }
  h2 { font-size: 1.35rem; } h3 { font-size: 1.15rem; }
  p { margin: 0.75em 0; } ul, ol { margin: 0.75em 0; padding-left: 1.5em; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #e2e0dc; padding: 0.5em 0.75em; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  pre { background: #f9f7f3; border: 1px solid #e2e0dc; border-radius: 6px; padding: 1em; overflow-x: auto; font-size: 0.9em; }
  code { font-family: ui-monospace, monospace; font-size: 0.9em; background: #f5f5f5; padding: 0.15em 0.4em; border-radius: 4px; }
  pre code { background: none; padding: 0; } a { color: #4c6ef5; }
  hr { border: none; border-top: 1px solid #e2e0dc; margin: 1.5em 0; }
`

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function collectMdFiles(dir: string, prefix: string): string[] {
  const out: string[] = []
  try {
    for (const name of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${name.name}` : name.name
      if (name.isDirectory()) {
        out.push(...collectMdFiles(join(dir, name.name), rel))
      } else if (name.name.endsWith('.md')) {
        out.push(rel.replace(/\.md$/, ''))
      }
    }
  } catch {
    // ignore missing dirs
  }
  return out
}

function serveDocsPlugin() {
  return {
    name: 'serve-docs',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        let pathname = req.url ?? ''
        const q = pathname.indexOf('?')
        if (q !== -1) pathname = pathname.slice(0, q)
        if (pathname !== DOCS_PREFIX && pathname !== `${DOCS_PREFIX}/` && !pathname.startsWith(`${DOCS_PREFIX}/`)) {
          return next()
        }
        const rel = pathname.slice(DOCS_PREFIX.length).replace(/^\//, '').replace(/\.html$/, '').trim()

        // Index: list all .md files
        if (rel === '' || rel === 'index') {
          const docs = collectMdFiles('docs', '')
          const specs = collectMdFiles('specs', 'specs')
          const links = [...docs, ...specs].sort().map((p) => `<li><a href="${escapeHtml(p)}.html">${escapeHtml(p)}</a></li>`).join('\n')
          const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tinker — Docs</title><style>${DOCS_CSS}</style></head><body><h1>Tinker — Docs</h1><p>Markdown served on the fly. Pick a doc:</p><ul>${links}</ul></body></html>`
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(html)
          return
        }

        // Map URL path to .md path: "future/community-architecture" → docs/future/community-architecture.md, "specs/08-multi-mode" → specs/08-multi-mode.md
        const mdPath = rel.startsWith('specs/') ? `${rel}.md` : join('docs', `${rel}.md`)
        const filePath = join(ROOT, mdPath)
        if (!existsSync(filePath)) {
          res.statusCode = 404
          res.end('Not found')
          return
        }
        const md = readFileSync(filePath, 'utf-8')
        const titleMatch = md.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1].trim() : 'Document'
        const body = marked.parse(md, { async: false }) as string
        const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>${DOCS_CSS}</style></head><body>${body}</body></html>`
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(html)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/tinker/',
    plugins: [react(), tailwindcss(), serveDocsPlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api/ai': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ai/, ''),
          headers: {
            'x-api-key': env.ANTHROPIC_API_KEY ?? '',
            'anthropic-version': '2023-06-01',
          },
        },
      },
    },
    optimizeDeps: {
      include: ['scratch-vm', 'scratch-render', 'scratch-storage', 'scratch-svg-renderer'],
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/, /scratch-vm/, /scratch-render/, /scratch-storage/, /scratch-svg-renderer/],
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
    },
  }
})
