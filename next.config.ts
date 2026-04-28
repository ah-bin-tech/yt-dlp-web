import type { NextConfig } from 'next'
import process from 'node:process'

const backendDev = process.env.BACKEND_DEV_URL ?? 'http://127.0.0.1:8000'

const nextConfig: NextConfig = {
  /** 本地 ``next dev`` 时将同源 ``/api/*`` 转到本机 FastAPI；生产部署由 ``vercel.json`` 的 rewrites 处理 */
  async rewrites() {
    if (process.env.NODE_ENV !== 'development')
      return []
    return [
      { source: '/api/extract', destination: `${backendDev.replace(/\/$/, '')}/extract` },
      { source: '/api/health', destination: `${backendDev.replace(/\/$/, '')}/health` },
    ]
  },
}

export default nextConfig
