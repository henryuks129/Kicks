import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { commerceDevApi, serverEnvNames } from './server/dev-api.js'

export default defineConfig(({ command, mode }) => {
  const skipEnv = process.env.KICKS_SKIP_ENV_FILES === 'true'
  if (command === 'serve' && !skipEnv) {
    const local = loadEnv(mode, process.cwd(), '')
    for (const name of serverEnvNames) {
      if (process.env[name] === undefined && local[name] !== undefined) process.env[name] = local[name]
    }
  }
  return {
    envDir: skipEnv ? false : undefined,
    plugins: [react(), tailwindcss(), commerceDevApi()],
  }
})
