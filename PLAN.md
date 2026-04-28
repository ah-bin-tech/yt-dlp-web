# yt-dlp-web

基于 yt-dlp 视频直链提取器

前端使用 Next.js + shadcn/ui

后端使用 FastAPI

使用 Vercel 进行部署

用户在前端页面输入视频的链接，后端调用 yt-dlp 获取视频直链返回到前端展示

目录参考如下

```txt
- api
	- main.py // 后端使用 FastAPI
- README.md
- PLAN.md
- src // 前端使用 Next.js + shadcn/ui
	- app
	- components
- vercel.json
```



