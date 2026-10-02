# Repo Time Machine

> 把 Git 提交历史变成一份可播放、可探索的项目档案。

Repo Time Machine 是一个**本地优先**的 Git 仓库历史可视化 MVP。它将散落在 `git log`、文件历史、tag 与 diff 中的事实，聚合为统一的 `report.json`，并用可交互的时间线、文件生命周期与提交回放来阅读。

## 当前能力

- **内置演示仓库**：打开即能体验总览、时间线、文件演进和提交回放。
- **公开 GitHub 导入**：粘贴 `https://github.com/owner/repo`，读取公开仓库的最近提交、文件树、tag、语言与提交差异元数据。
- **本地 Git CLI**：在你的机器上使用 `git` 生成标准报告 JSON，再导入网页。
- **四个同步视图**：Overview、Timeline、File Explorer、Commit Replay 共用当前时间点。
- **本地归档**：下载当前报告 JSON；不会上传你的私有代码或报告。

## 快速运行

```bash
pnpm install
pnpm dev
```

访问 `http://localhost:3000`。

## 分析本地仓库

Repo Time Machine 不会在网页中假装读取 `.git` 对象。请在有 Git 的本机运行 CLI：

```bash
# 在 Repo Time Machine 项目目录中
pnpm analyze /path/to/your/repository --output /tmp/my-project-report.json
```

在网页左侧点击 **“导入 report.json”**，选择输出文件即可。CLI 会读取最多 200 条提交，记录提交元数据、numstat、tag、文件级聚合信息与受控长度 diff。

## 公开 GitHub 仓库

输入公开地址即可加载。该模式不需要令牌，但受 GitHub 匿名 API 速率与公开信息范围限制；目前读取最近 20 条提交。私有仓库请使用本地 CLI。

## 数据与隐私

- 核心分析在本地 Git CLI 或你的浏览器中完成。
- `report.json` 不包含完整仓库快照，但可能包含提交消息、路径、作者、统计信息和截断 diff；分享前请自行检查。
- 当前版本不提供账户、云端托管、私有仓库授权或 AI 自动叙事。
- “可携带归档”是浏览器下载，不向服务端上传任何内容。

## 项目结构

```text
src/                 React 可视化应用
scripts/analyze-repo.mjs   本地 Git → report.json CLI
plan.md              产品与设计决策
```

## 开发命令

```bash
pnpm check      # TypeScript 类型检查
pnpm build      # 生成静态站点到 dist/
pnpm analyze . --output report.json
```

## Roadmap

- [ ] 可嵌入的静态报告导出目录
- [ ] 基于 token 的 GitHub 大仓库导入
- [ ] 分支对比和文件依赖视图
- [ ] 经过授权的安全报告存储与分享链接

MIT
