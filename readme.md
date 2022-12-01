# github-notion-star

使用 Notion 和 Github Actions 同步和管理你的 Github Star.

## Breaking Change

从 [#4](https://github.com/lcjnil/github-notion-star/issues/4) 版本开始，增加了 `Primary Language` 和 `Repository Topics` 两个参数（by @imfycc），需要在原有 database 中增加这两个选项，否则同步会失败。

## 功能

- （可选）支持全量同步所有的 star 到 notion
- （可选）支持使用 Github Actions 定时同步增量的 star 到 notion

## 设置

- 在 Notion 上复制这个[模板](https://lcj.notion.site/Github-Notion-Star-f07e2f086e4d4f5b9f25693814c836de)
- Fork 当前的这个 Repo
- 在 Repo 的设置里面，新建一个名为 notion-sync 的 Environment，需要设置以下环境变量
    - `NOTION_API_KEY` 申请的 Notion API 的 Key，注意，你的模板需要被共享给这个 API
    - `NOTION_DATABASE_ID` 对应的 Notion Database ID
    - `TOKEN_OF_GITHUB` Github 的用户 token，用于获取当前用户的 API

除此之外，还可以修改环境变量的形式修改当前的配置，例如：

- `FULLSYNC_LIMIT` 全量同步的最大 Repo 个数，默认为 2000 个
- `PARTIALSYNC_LIMIT` 增量同步的最大 Repo 个数，每次增量同步会从后往前取若干条数据，默认为 10 个
- `REPO_TOPICS_LIMIT` Repo 添加的话题数量，默认取前 50 个

需要在 `github/workflows/*.yml` 中，修改这个配置

<details><summary>如何找到 NOTION_API_KEY？</summary>
请参考：https://www.notion.so/Add-and-manage-integrations-with-the-API-910ac902372042bc9da38d48171269cd#eeaa235ffe834d4f9a89a5893398f341
</details>

<details><summary>如何找到 NOTION DATABASE ID</summary>
请参考：https://stackoverflow.com/questions/67728038/where-to-find-database-id-for-my-database-in-notion
</details>

<details><summary>如何申请 Github API TOKEN</summary>
请参考：https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token.

这里不需要勾选任何权限。
</details>

## 开始同步

### （可选）全量同步

可以在当前的 Github Actions 里面找到 `FullSync Notion Star`，执行即可全部你之前所有的 Star 信息

### （可选）增量同步

1. （可选）当前默认的轮询时间是十分钟。如果你想要修改增量同步轮询的时间，需要修改 `.github/workflows/partial-sync.yml`，在 `on.schedule.cron` 里面设置你的轮询时间。
2. 在 Github Actions 里面开启 `Partial Sync Notion Star` （对于 Fork 的 repo，会自动禁用所有轮询的 Actions，所以需要手动开启）
