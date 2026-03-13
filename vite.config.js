import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'api-chat-proxy',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
              })
              return res.end()
            }

            if (req.method !== 'POST') {
              res.writeHead(405, { 'Content-Type': 'application/json' })
              return res.end(JSON.stringify({ error: 'Method not allowed' }))
            }

            // Parse body
            let body = ''
            for await (const chunk of req) body += chunk
            let parsed
            try {
              parsed = JSON.parse(body)
            } catch {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              return res.end(JSON.stringify({ error: 'Invalid JSON' }))
            }

            const apiKey = env.OPENAI_API_KEY
            if (!apiKey) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              return res.end(JSON.stringify({ error: 'OPENAI_API_KEY not set in .env' }))
            }

            try {
              const { messages } = parsed
              const trimmed = (messages || []).slice(-20)

              const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [
                    { role: 'system', content: 'You are the Blackbox Bootcamp AI Assistant — an expert tutor for Zama\'s FHEVM (Fully Homomorphic Encryption Virtual Machine). You help developers learn to build encrypted smart contracts on Ethereum. Be concise, use Solidity code examples when helpful, and reference the bootcamp curriculum when relevant. Keep responses under 300 words unless asked for detail.' },
                    ...trimmed,
                  ],
                  max_tokens: 1024,
                  temperature: 0.7,
                }),
              })

              if (!response.ok) {
                const err = await response.text()
                res.writeHead(response.status, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({ error: err }))
              }

              const data = await response.json()
              res.writeHead(200, { 'Content-Type': 'application/json' })
              return res.end(JSON.stringify({ reply: data.choices[0].message.content }))
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              return res.end(JSON.stringify({ error: 'Internal server error' }))
            }
          })
        },
      },
    ],
  }
})
