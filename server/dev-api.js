import commerce from '../api/commerce.js'

export const serverEnvNames = [
 'SUPABASE_SECRET_KEY', 'VITE_SUPABASE_URL', 'VITE_APP_URL',
 'PAYSTACK_SECRET_KEY', 'MAILERSEND_API_KEY', 'MAILERSEND_FROM_EMAIL',
 'MAILERSEND_FROM_NAME', 'MAILERSEND_REPLY_TO_EMAIL', 'RECEIPT_IMAGE_BASE_URL', 'ENABLE_DEMO_PAYMENTS',
]

export function commerceDevApi() {
 return {
  name: 'kicks-local-commerce',
  apply: 'serve',
  configureServer(server) {
   server.middlewares.use(async (req, res, next) => {
    if (req.url?.split('?')[0] !== '/api/commerce') return next()
    res.status = code => { res.statusCode = code; return res }
    res.json = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)) }
    try {
     let body = ''; let size = 0
     for await (const chunk of req) {
      size += chunk.length
      if (size > 16384) return res.status(413).json({error:'Request too large'})
      body += chunk.toString()
     }
     req.body = body ? JSON.parse(body) : {}
     req.localDevelopment = true
     await commerce(req, res)
    } catch { res.status(400).json({error:'Invalid request'}) }
   })
  },
 }
}
