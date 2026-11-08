# Changelog

## Unreleased

### Changed

- 构建改用 npm 发布的插件 SDK 3.0.0，无需检出 Nons 源码；CI 与 Release 直接安装发布包。

## 2.0.0

### Breaking

- 需要 Nons 插件 API 3.0.0 与 UI API 3.0.0；不再兼容 2.x 宿主。
- 网络能力在插件 API 3 中默认开启；本插件仍只读取本地打包视频，不发起网络请求。

### Changed

- 适配 Nons 插件 API 3 与新的 Manifest 校验。
- 视频仍随插件打包并在本地播放，不依赖网络请求。

### Fixed

- 补齐触发守卫的预加载观察和重试方法类型声明，修复插件构建时的 TS2339 错误。
