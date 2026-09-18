# 清和与晚棠

顾清和与沈晚棠的中西合璧婚礼站点：电影感主页、请柬、Three.js 照片墙。

```bash
npm install
npm run dev
```

- 主页 `/`
- 请柬 `/invite`
- 照片墙 `/wall`

静态站（GitHub Pages / Cloudflare）在 `docs/`。

## 部署到 Cloudflare Pages

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub，选仓库 `Jiahub77/ai-miss`
3. 构建设置：
   - Framework preset：`None`
   - Build command：空着
   - Build output directory：`docs`
4. **Save and Deploy**

上线后地址类似：`https://qinghe-wantang.pages.dev`

之后每次 `git push` 会自动更新。

命令行也可以：

```bash
npx wrangler login
npx wrangler pages deploy docs --project-name qinghe-wantang
```
