# yt-dlp-web

基于 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 的视频直链提取：前端 **Next.js + shadcn/ui**，后端 **FastAPI**。前端输入视频页面链接，后端解析并返回可用直链。

## 本地开发

同时启动后端与前端时，前端默认走**同源**路径 `/api/extract`，由 Next（`next.config.ts` 中仅在 development 生效的 rewrites）转发到本机 FastAPI。

### 后端

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux

pip install -r requirements.txt
uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

健康检查：

- 直连后端：<http://127.0.0.1:8000/health>
- 经 Next 代理（需先 `npm run dev`）：<http://localhost:3000/api/health>

### 前端

```bash
npm install
npm run dev
```

浏览器打开 <http://localhost:3000>。未配置环境变量时，请求发往同源 `/api/extract`（开发环境由 Next 转发到 `http://127.0.0.1:8000/extract`）。

可选：在 `.env.local` 中指定后端地址（将绕过 Next 转发、直接请求该 URL）：

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

可选：修改开发时代理目标（默认 `http://127.0.0.1:8000`）：

```bash
BACKEND_DEV_URL=http://127.0.0.1:8000
```

## Vercel 部署（前后端同一项目）

Vercel 会将 `api/*.py` 作为 Python Serverless Functions 部署：`/api/extract`（POST）与 `/api/health`（GET）。构建时前端执行 `npm install`，Python 依赖由 Vercel 根据 `requirements.txt` 自动安装。

部署后无需设置 `NEXT_PUBLIC_API_URL` 即可使用同源 `/api/extract`。若前后端分属不同域名，再设置 `NEXT_PUBLIC_API_URL` 并在后端配置 `CORS_ORIGINS`（逗号分隔）。

**说明：** yt-dlp 依赖较大，可能接近或超过 Vercel Function 体积/时长限制；若构建或运行失败，请将 API 部署到容器或 VPS，并把 `NEXT_PUBLIC_API_URL` 指过去。

## 说明

仅提取你有权访问的内容；请遵守各平台服务条款与版权法律。
