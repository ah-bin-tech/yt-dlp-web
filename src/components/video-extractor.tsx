'use client'

import { Copy, Link2, Loader2 } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormatItem {
  format_id?: string | null
  ext?: string | null
  resolution?: string | null
  url: string
  vcodec?: string | null
  acodec?: string | null
  filesize_approx?: number | null
}

interface ExtractResponse {
  title?: string | null
  thumbnail?: string | null
  webpage_url?: string | null
  formats: FormatItem[]
  error?: string | null
}

/** 未设置 ``NEXT_PUBLIC_API_URL`` 时使用同源 ``/api/extract``（Vercel 上由 ``vercel.json`` rewrite 到 Python）。 */
function extractEndpoint(): string {
  // eslint-disable-next-line node/prefer-global/process
  const explicit = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
  if (explicit)
    return `${explicit}/extract`
  return '/api/extract'
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  }
  catch {
    // ignore
  }
}

export function VideoExtractor() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [data, setData] = useState<ExtractResponse | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setErr(null)
      setData(null)
      const trimmed = url.trim()
      if (!trimmed) {
        setErr('请输入链接')
        return
      }
      setLoading(true)
      try {
        const res = await fetch(extractEndpoint(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        })
        let json: (ExtractResponse & { detail?: unknown }) | null = null
        let rawText: string | null = null
        try {
          json = (await res.json()) as ExtractResponse & { detail?: unknown }
        }
        catch {
          try {
            rawText = await res.text()
          }
          catch {
            // ignore
          }
        }

        if (!res.ok) {
          const detail = json?.detail
          const msg
            = typeof detail === 'string'
              ? detail
              : Array.isArray(detail)
                ? detail.map((d: { msg?: string }) => d.msg).join('; ')
                : rawText?.slice(0, 200) || res.statusText
          setErr(`请求失败（${res.status}）：${msg || '服务异常'}`)
          return
        }

        if (!json) {
          setErr(`请求失败（${res.status}）：响应不是 JSON`)
          return
        }
        setData(json)
      }
      catch {
        setErr(
          '网络错误或服务不可用。本地请运行 uvicorn，并与 next dev 同时使用同源 /api（见 README）；或设置 NEXT_PUBLIC_API_URL。',
        )
      }
      finally {
        setLoading(false)
      }
    },
    [url],
  )

  const onCopy = async (u: string, key: string) => {
    await copyText(u)
    setCopied(key)
    setTimeout(setCopied, 2000, null)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-6 md:p-10">
      <header className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-semibold tracking-tight">视频直链提取</h1>
        <p className="text-muted-foreground text-sm">
          粘贴视频页面 URL，通过 yt-dlp 解析并返回可用直链（仅用于你有权访问的内容）。
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="size-5" />
            输入链接
          </CardTitle>
          <CardDescription>
            支持 YouTube、Bilibili 等 yt-dlp 支持的站点。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="video-url">视频页面 URL</Label>
              <Input
                id="video-url"
                type="url"
                name="url"
                placeholder="https://..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                autoComplete="off"
              />
            </div>
            <Button type="submit" disabled={loading} className="shrink-0 sm:w-auto">
              {loading
                ? (
                    <>
                      <Loader2 className="animate-spin" />
                      解析中
                    </>
                  )
                : (
                    '提取直链'
                  )}
            </Button>
          </form>
          {err && (
            <p className="text-destructive mt-4 text-sm" role="alert">
              {err}
            </p>
          )}
        </CardContent>
      </Card>

      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">解析结果</CardTitle>
            {data.title && (
              <CardDescription className="text-foreground/90 font-medium">
                {data.title}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {data.thumbnail && (
              <img
                src={data.thumbnail}
                alt=""
                className="max-h-40 rounded-md border object-contain"
              />
            )}
            {data.formats.length === 0
              ? (
                  <p className="text-muted-foreground text-sm">未返回可展示的直链。</p>
                )
              : (
                  <ul className="space-y-3">
                    {data.formats.map((f, i) => {
                      const key = `${f.format_id ?? i}-${i}`
                      const label = [f.resolution, f.ext, f.format_id]
                        .filter(Boolean)
                        .join(' · ')
                      return (
                        <li
                          key={key}
                          className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="truncate text-sm font-medium">{label || '直链'}</p>
                            <p className="text-muted-foreground truncate font-mono text-xs">
                              {f.url}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={() => onCopy(f.url, key)}
                          >
                            <Copy className="size-4" />
                            {copied === key ? '已复制' : '复制'}
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
