# genshin-start

不要播放那首歌……

当 NonsPlayer 当前播放曲目为 `Shed a Light`，艺人包含 Robin Schulz、David Guetta 和 Cheat Codes，并且播放中进度到达 1:19 时，插件会打开一个无边框窗口播放随插件安装的视频。窗口按当前屏幕报告的尺寸与可用原点铺满显示区域；此方式是窗口铺满，不是系统原生全屏状态。视频结束、点击关闭或按 Escape 可关闭窗口。

插件使用 `player:read`、`ui` 和 `window:manage` 权限。独立窗口功能当前仅支持 Windows。若宿主 WebView 阻止带声音自动播放，窗口会显示“点击开始播放”按钮。

## 构建与验证

要求 Node.js 22 或更新版本和 pnpm 11。

```powershell
pnpm install --frozen-lockfile
pnpm format
pnpm test
pnpm build
pnpm format:check
```

`pnpm build` 会把 `assets/genshen-start.mp4` 打入插件 ZIP。安装 ZIP 并确认权限后启用插件；宿主还需支持视频 MIME 与 Range 请求。
