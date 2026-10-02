# 首篇发布文案：React Hooks 演进

> 使用目的：把 Repo Time Machine 作为“理解代码库历史”的工具推出，而不是夸大它已经自动解释所有业务原因。

## 推荐首发：英文主贴（X / LinkedIn / Reddit / Show HN 补充材料）

**Title**

> I built a time machine for Git repositories

**Post**

In 2018, React Hooks were introduced at React Conf. On February 6, 2019, React 16.8 made Hooks available in a stable release.

That kind of change is more than a line in a changelog. It is a question every maintainer or new teammate eventually asks:

> What did this repository look like before this idea existed — and what changed when it arrived?

I built **Repo Time Machine** to make that question easier to explore.

It turns Git history into a local-first, playable project archive:

- scrub a repository to a point in time
- follow a file or module from its first appearance
- jump between milestones, tags, and releases
- stop on a commit and read the affected files + diff

No account. No private-code upload. Start with a public GitHub URL or generate a portable report from your local Git repository.

**Live demo:** https://repotime-ffym3eeu.manus.space  
**GitHub:** https://github.com/zeweijin86-hub/Repo-Time-Machine

The goal is not to replace Git. It is to make a codebase's historical shape visible before you dive into details.

If this sounds useful, a star helps other developers find it.

## 中文版本（V2EX / 掘金 / 即刻）

**标题**

> 我做了一个 Git 仓库时光机：把提交历史变成可播放的项目档案

**正文**

2018 年 React Conf 上，React Hooks 被正式介绍；2019 年 2 月 6 日，React 16.8 将 Hooks 带入稳定版本。

这种变化不只是 changelog 里的一行字。接手一个成熟项目时，人们真正会问的是：

> “这个概念出现之前，仓库长什么样？它加入后，哪些模块和代码路径一起变了？”

所以我做了 **Repo Time Machine**。

它把 Git 历史做成本地优先、可以拖动和回放的项目档案：

- 拖动时间轴，回到某个项目阶段
- 看一个文件/模块何时出现、由谁频繁修改
- 在 tag、release、重构节点之间跳转
- 停在一次提交，直接看影响文件和受控 diff

支持直接粘贴公开 GitHub 仓库，也支持本地 Git 仓库生成可携带 `report.json`。不需要账号，也不会上传私有代码。

体验地址：https://repotime-ffym3eeu.manus.space  
开源地址：https://github.com/zeweijin86-hub/Repo-Time-Machine

它不试图替代 Git；它想做的是让你在钻进细节之前，先看清一个代码库的**历史形状**。

如果这个方向对你有用，欢迎 Star，让更多维护者和新同事能找到它。

## 配图 / GIF 说明

配图使用仓库内 `public/media/repo-time-machine-demo.gif`：

1. Overview：看到项目当前阶段与历史指标。
2. Timeline：跳转到 TypeScript migration 这一里程碑。
3. File Explorer：查看 `notes.ts` 的文件生命周期和贡献者。
4. Commit Replay：打开对应提交的影响范围与 diff。

## 事实核对与可引用来源

1. React 官方 Hooks 文档指出：Hooks 在 React 16.8 中加入；React Conf 2018 上由 Sophie Alpert 和 Dan Abramov 介绍；Hooks 可让函数组件使用 state 和其他 React 特性而不需要 class。  
   https://legacy.reactjs.org/docs/hooks-intro.html
2. React 官方 React 16.8 发布文确认：2019 年 2 月 6 日，Hooks 随 React 16.8 进入稳定版本；官方明确建议渐进采用，而不是“一夜重写”。  
   https://legacy.reactjs.org/blog/2019/02/06/react-v16.8.0.html

## 发布建议

- 发帖首图/首 GIF 使用演示动图，正文第一段只讲一个历史问题，不堆功能列表。
- 不要声称本工具已经自动分析了 React 在 Hooks 前后的完整历史；当前版本更准确的表述是“它让这类历史问题变得可探索”。
- Hacker News 标题可用：`Show HN: Repo Time Machine – Explore Git history as a playable project archive`。
